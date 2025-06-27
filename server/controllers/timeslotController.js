import pool from "../models/db.js";
import { responseTemp } from "../templates/responseTemplate.js";
import moment from "moment";

/**
 * Helper: fetch all booked appointments for a given timeslot ID.
 * Adjust the SELECT / JOINs according to your schema.
 * Returns array of objects with at least:
 *   appointmentId, userID, userEmail, userName, serviceName, serviceRequestedDate,
 *   (and optionally existing timeslot info).
 */
const getBookedAppointmentsForTimeslot = async (timeslotId) => {
  // Example query: join appointments, users, services. Adjust table/column names.
  const [rows] = await pool.execute(
    `SELECT 
       a.id AS appointmentId,
       a.userID AS userID,
       u.email AS userEmail,
       CONCAT(u.firstName, ' ', u.lastName) AS userFullName,
       s.name AS serviceName,
       a.serviceRequestedDate AS serviceRequestedDate,
       t.startTime AS existingStartTime,
       t.endTime AS existingEndTime
     FROM appointments a
     JOIN users u ON a.userID = u.id
     JOIN services s ON a.serviceID = s.id
     JOIN timeslots t ON a.timeslotID = t.id
     WHERE a.timeslotID = ? AND (a.isApproved = 1 OR a.isPending = 1)
     `,
    [timeslotId]
  );
  return rows; // possibly empty array
};
export const createTimestlot = async (req, res) => {
  const { dateOfTimeslots, startTime, endTime, createdBy, createdDate } =
    req.body;

  try {
    const [result] = await pool.execute(
      "CALL sp_timeslots_createTimeslot(?,?,?,?,?)",
      [dateOfTimeslots, startTime, endTime, createdBy, createdDate]
    );

    const timeSlot = result[0][0];

    if (timeSlot.affectedRows === 0) {
      return res
        .status(201)
        .json(responseTemp(1, "Already configured for timeslot.!", null));
    } else {
      return res
        .status(200)
        .json(
          responseTemp(
            1,
            "Successfully created the timeslot.!",
            timeSlot.affectedRows
          )
        );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const updateTimeslot = async (req, res) => {
  const { id, dateOfTimeslots, startTime, endTime, modifiedBy } = req.body;
  const slotID = id;
  console.log(
    "Updating timeslot ID:",
    slotID,
    dateOfTimeslots,
    startTime,
    endTime,
    modifiedBy
  );

  // Get Socket.IO instance (ensure you did app.set('io', io) in your main server)
  const io = req.app.get("io");

  let connection;
  try {
    // 1. Optionally: Begin transaction if you want atomic operations
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 2. Perform the timeslot update via stored procedure
    const [result] = await connection.execute(
      "CALL sp_timeslots_updateTimeslot(?,?,?,?,?)",
      [slotID, dateOfTimeslots, startTime, endTime, modifiedBy]
    );
    const row = result[0][0];
    if (row.affectedRows === 0) {
      await connection.commit();
      return res
        .status(201)
        .json(responseTemp(1, "Timeslot update failed.!", null));
    }

    // 3. After updating the timeslot, find any booked appointments for this timeslot
    //    Use a separate connection or same connection; here we use same connection:
    const bookedAppointments = await getBookedAppointmentsForTimeslot(slotID);
    // bookedAppointments: array of { appointmentId, userID, userEmail, userName, serviceName, serviceRequestedDate, existingStartTime, existingEndTime }

    // 4. Commit timeslot update before notifications
    await connection.commit();
    connection.release();
    connection = null;

    // 5. For each booked appointment, notify the user in real-time and via email
    for (const appt of bookedAppointments) {
      const { appointmentId, userID, userEmail, userName, serviceName } = appt;
      // Construct a message
      const messageText = `Your appointment (ID: ${appointmentId})'s timeslot has been updated by admin. New date/time: ${moment(
        dateOfTimeslots
      ).format("YYYY-MM-DD")} at ${startTime.slice(0, 5)}. Please review.`;

      // 5a. Real-time notification via Socket.IO & DB insert
      try {
        await notifyUser({
          userId: userID,
          appointmentId,
          message: messageText,
          io, // so notifyUser will do insert + emit
        });
      } catch (notifErr) {
        console.error(
          `Failed to notify user ${userID} real-time for appointment ${appointmentId}:`,
          notifErr
        );
      }

      // 5b. Send email notification
      try {
        // Prepare detail object for email template. Adjust fields based on your template requirements.
        const detail = {
          userName,
          userEmail,
          appointmentId,
          serviceName,
          // Use the updated timeslot date/time:
          serviceRequestedDate: dateOfTimeslots, // e.g. "2025-06-30"
          timeslotStart: startTime, // e.g. "10:00:00"
          timeslotEnd: endTime, // e.g. "11:00:00"
          paymentMethod: appt.paymentMethod || "", // if needed, or fetch if required
          comments: appt.comments || "", // if available
        };
        await sendUserAppointmentEmail(detail);
      } catch (emailErr) {
        console.error(
          `Failed to send email to user ${userEmail} for appointment ${appointmentId}:`,
          emailErr
        );
      }
    }

    // 6. Return success response
    return res
      .status(200)
      .json(
        responseTemp(
          1,
          "Successfully updated the timeslot.! ",
          row.affectedRows
        )
      );
  } catch (error) {
    console.error("Error in updateTimeslot:", error);
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};

export const deleteTimeslot = async (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid timeslot id.!" });
  }

  // Get Socket.IO instance
  const io = req.app.get("io");

  let connection;
  try {
    // 1. Before deletion, find booked appointments linked to this timeslot
    const bookedAppointments = await getBookedAppointmentsForTimeslot(
      numericId
    );

    // 2. Optionally: Invalidate or cancel those appointments in DB?
    //    Depending on your business logic: you might mark appointments as cancelled.
    //    If you have a stored procedure, call it here. E.g.:
    //    await pool.execute("CALL sp_appointments_cancelByTimeslot(?)", [numericId]);
    //    For now, we only notify users; cancellation logic can be added.

    // 3. Perform the timeslot deletion
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      "CALL sp_timeslots_deleteTimeslot(?)",
      [numericId]
    );
    const row = result[0][0];
    if (row.affectedRows === 0) {
      await connection.commit();
      return res
        .status(201)
        .json(responseTemp(1, "Time slot delete failed.!", null));
    }

    await connection.commit();
    connection.release();
    connection = null;

    // 4. Notify each affected user that their appointment timeslot was removed
    for (const appt of bookedAppointments) {
      const {
        appointmentId,
        userID,
        userEmail,
        userName,
        serviceName,
        serviceRequestedDate,
      } = appt;
      // Message to user
      const messageText = `Your appointment (ID: ${appointmentId}) timeslot has been deleted by admin. Please reschedule.`;

      // 4a. Real-time notification
      try {
        await notifyUser({
          userId: userID,
          appointmentId,
          message: messageText,
          io,
        });
      } catch (notifErr) {
        console.error(
          `Failed to notify user ${userID} real-time for appointment ${appointmentId} deletion:`,
          notifErr
        );
      }

      // 4b. Send email notification
      try {
        const detail = {
          userName,
          userEmail,
          appointmentId,
          serviceName,
          // The original date/time:
          serviceRequestedDate, // from DB, e.g. "2025-06-30"
          // timeslotStart/end from DB? If needed, you can include old timeslot
          // but since timeslot is deleted, focus on notifying user to reschedule.
          // You might include a link to their dashboard: e.g. adminLink or userLink
        };
        // You might have a dedicated email template for cancellation/reschedule
        // For now, reuse sendUserAppointmentEmail but modify subject/body accordingly.
        await sendUserAppointmentEmail({
          ...detail,
          // If your template needs timeslotStart:
          timeslotStart: appt.existingStartTime,
          timeslotEnd: appt.existingEndTime,
          comments: appt.comments || "",
          paymentMethod: appt.paymentMethod || "",
        });
      } catch (emailErr) {
        console.error(
          `Failed to send deletion email to user ${userEmail} for appointment ${appointmentId}:`,
          emailErr
        );
      }
    }

    return res
      .status(200)
      .json(
        responseTemp(1, "Successfully deleted the timeslot.!", row.affectedRows)
      );
  } catch (error) {
    console.error("Error in deleteTimeslot:", error);
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getTimeslotHistory = async (req, res) => {
  try {
    const [result] = await pool.execute(
      "CALL sp_timeslots_getTimeslotsHistory()"
    );
    const timeslotHistory = result[0];
    if (timeslotHistory.length > 0) {
      return res
        .status(200)
        .json(
          responseTemp(
            1,
            "Successfully loaded the timeslots history.!",
            timeslotHistory
          )
        );
    } else {
      return res
        .status(201)
        .json(responseTemp(1, "Timeslot history not available.!", []));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getTimeslotByID = async (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid user id.!" });
  }
  try {
    const [result] = await pool.execute(
      "CALL sp_timeslots_getTimeslotByID(?)",
      [numericId]
    );

    const response = result[0][0];
    if (!response) {
      return res.status(201).json(responseTemp(1, "Timeslot not found.!", {}));
    } else {
      return res
        .status(200)
        .json(responseTemp(1, "Successfully loaded the timeslot.!", response));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getAllTimeslots = async (req, res) => {
  const { fromDate, toDate } = req.body;

  try {
    const [result] = await pool.execute(
      "CALL sp_timeslots_getAllTimeSlots(?,?)",
      [fromDate, toDate]
    );
    const rows = result[0];
    if (rows.length > 0) {
      const rowsWithStringDates = rows.map((row) => ({
        ...row,
        dateOftimeslots: moment(row.dateOftimeslots).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        dayOfWeek: moment(row.dateOftimeslots).format("dddd"),
      }));
      return res
        .status(200)
        .json(
          responseTemp(
            1,
            "Successfully loaded the timeslots.!",
            rowsWithStringDates
          )
        );
    } else {
      return res
        .status(201)
        .json(responseTemp(1, "No timeslots available.!", []));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};
