import pool from "../models/db.js";
import { responseTemp } from "../templates/responseTemplate.js";
import {
  formatDateTime,
  sendAdminAppointmentEmail,
  sendAdminAppointmentUpdateEmail,
  sendUserAppointmentEmail,
} from "../utils/emailService.js";
import { roles } from "../utils/enum.js";
import { notifyAdmins, notifyUser } from "./notificationController.js";

export const getAllAppointments = async (req, res) => {
  try {
    const [result] = await pool.execute(
      "CALL sp_appointments_getAllAppointments()"
    );
    if (result[0].length === 0) {
      res.status(201).json(responseTemp(1, "No appointments found.!", []));
    } else {
      res
        .status(200)
        .json(
          responseTemp(1, "Successfully loaded the appointments.!", result[0])
        );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const userID = req.user.id;
    const [result] = await pool.execute(
      "CALL sp_appointments_getAppointmentHistoryByUserID(?)",
      [userID]
    );

    if (!result[0] || result[0].length === 0) {
      return res
        .status(200)
        .json(responseTemp(1, "No appointments found.!", []));
    }
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const newList = result[0].map((i) => {
      return {
        ...i,
        imageUrl: i.image ? `${baseUrl}/${i.image}` : null,
      };
    });
    res
      .status(200)
      .json(responseTemp(1, "Appointments loaded successfully.!", newList));
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const createAppointment = async (req, res) => {
  const {
    serviceID,
    timeslotID,
    paymentMethod,
    address,
    comments,
    serviceRequestedDate,
  } = req.body;
  // before you call
  let rawAge = req.body.age; // might be "" or undefined
  let age = rawAge != null && rawAge !== "" ? parseInt(rawAge, 10) : null; // send NULL if empty

  if (age !== null && isNaN(age)) {
    throw new Error("Invalid age.!");
  }
  const userID = req.user.id;

  const io = req.app.get("io");
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [appointmentResult] = await connection.execute(
      "CALL sp_appointments_createAppointment(?, ?, ?, ?, ?, ?, ?, ?,?)",
      [
        userID,
        serviceID,
        timeslotID,
        paymentMethod,
        address,
        age,
        comments,
        serviceRequestedDate,
        contactNumber,
      ]
    );
    const appointment = appointmentResult[0][0];

    await connection.commit();
    connection.release();
    connection = null;

    // 1. Notify admins (DB insert + emit + email)
    await notifyAdmins({
      appointmentId: appointment.id,
      message: `New appointment created by user ${userID} for service ${serviceID}`,
      io,
      type: "appointment",
    });
    // 2. Notify the user
    await notifyUser({
      userId: userID,
      appointmentId: appointment.id,
      message: "Your appointment has been created.!",
      io,
      type: "appointment",
    });

    // 3. Optionally emit UI event for other clients (e.g., admin dashboards)
    io.to("user_admin").emit("appointmentCreated", { appointment });
    // or: io.to(`appointment_${appointment.id}`).emit("appointmentCreated", appointment);
    sendAdminAppointmentEmail(process.env.SMTP_USER, appointment);
    sendUserAppointmentEmail(appointment);

    return res
      .status(201)
      .json(responseTemp(1, "Appointment created successfully.!", appointment));
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Error creating appointment:", error);
    return res
      .status(500)
      .json(responseTemp(0, "Failed to create appointment.!", null));
  }
};

export const updateAppointment = async (req, res) => {
  const connection = await pool.getConnection();
  const io = req.app.get("io");
  try {
    await connection.beginTransaction();
    const {
      appointmentID,
      serviceID,
      timeslotID,
      paymentMethod,
      comments,
      contactNumber,
      address,
    } = req.body;
    console.log(address, "address");

    const userID = req.user.id;

    console.log(req.body, "updateAppointment");

    let rawAge = req.body.age; // might be "" or undefined
    let age = rawAge != null && rawAge !== "" ? parseInt(rawAge, 10) : null; // send NULL if empty

    if (age !== null && isNaN(age)) {
      throw new Error("Invalid age.!");
    }

    // 1. Fetch old details
    const [oldRows] = await connection.execute(
      `SELECT a.id AS appointmentId,
              s.name AS serviceName,
              a.serviceRequestedDate,
              t.startTime AS timeslotStart,
              a.paymentMethod,
              a.comments,
              u.username AS userName,
              u.email AS userEmail,
              u.contactNumber AS userPhone
       FROM appointments a
       JOIN services s ON a.serviceID = s.id
       JOIN timeslots t ON a.timeslotID = t.id
       JOIN users u ON a.userID = u.id
       WHERE a.id = ? AND a.userID = ?`,
      [appointmentID, userID]
    );
    if (!oldRows.length) {
      connection.release();
      return res
        .status(400)
        .json(
          responseTemp(0, "Appointment not found or cannot be updated.!", null)
        );
    }
    const old = oldRows[0];
    // Format old.requestedDate for email:
    const oldRequestedDate = formatDateTime(
      old.serviceRequestedDate,
      old.startTime
    );

    // 2. Perform update
    await connection.execute(
      "CALL sp_appointments_updateAppointment(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        appointmentID,
        serviceID,
        timeslotID,
        paymentMethod,
        comments,
        age,
        address,
        userID,
        contactNumber,
      ]
    );

    // 3. Fetch new details
    const [newRows] = await connection.execute(
      `SELECT a.id AS appointmentId,
              s.name AS serviceName,
              a.serviceRequestedDate,
              t.startTime AS timeslotStart,
              a.paymentMethod,
              a.comments,
              u.username AS userName,
              u.email AS userEmail,
              u.contactNumber AS userPhone
       FROM appointments a
       JOIN services s ON a.serviceID = s.id
       JOIN timeslots t ON a.timeslotID = t.id
       JOIN users u ON a.userID = u.id
       WHERE a.id = ?`,
      [appointmentID]
    );
    const updated = newRows[0];
    console.log(updated, "updated");

    const newRequestedDate = formatDateTime(
      updated.serviceRequestedDate,
      updated.startTime
    );

    await connection.commit();
    connection.release();

    // 4. Notify admins & user using notificationService (DB + socket)
    await notifyAdmins({
      appointmentId: appointmentID,
      message: `Appointment ${appointmentID} updated by user ${userID}.!`,
      io,
      type: "appointment",
    });
    await notifyUser({
      userId: userID,
      appointmentId: appointmentID,
      message: `Your appointment has been updated.!`,
      io,
      type: "appointment",
    });

    // 5. Send email to admins about the changes
    // Fetch admin emails:
    const [adminRows] = await pool.query(
      `SELECT email FROM users WHERE roleID = ${roles.admin} `
    );
    for (const { email: adminEmail } of adminRows) {
      const detail = {
        appointmentId: appointmentID,
        userName: updated.userName,
        userEmail: updated.userEmail,
        userPhone: updated.userPhone,
        old: {
          serviceName: old.serviceName,
          requestedDate: oldRequestedDate,
          paymentMethod: old.paymentMethod,
          comments: old.comments || "None",
        },
        new: {
          serviceName: updated.serviceName,
          requestedDate: newRequestedDate,
          paymentMethod: updated.paymentMethod,
          comments: updated.comments || "None",
        },
        adminLink: `${process.env.FRONTEND_URL}/admin/appointments/${appointmentID}`,
      };
      // Send the email
      await sendAdminAppointmentUpdateEmail({ adminEmail, detail });
    }

    // 6. Optionally emit a UI event
    io.to("user_admin").emit("appointmentUpdated", {
      appointmentId: appointmentID,
      updatedFields: {
        serviceID,
        timeslotID,
        paymentMethod,
        comments,
      },
    });

    return res
      .status(200)
      .json(responseTemp(1, "Appointment updated successfully.!", updated));
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error updating appointment:", error);
    return res
      .status(500)
      .json(responseTemp(0, "Error updating appointment.!", null));
  }
};

export const updateAppointmentStatus = async (req, res) => {
  const { appointmentID, status } = req.body;
  console.log(req.body, "updateAppointmentStatus");

  const io = req.app.get("io");
  try {
    const [result] = await pool.execute(
      "CALL sp_appointments_authorizeAppointment(?, ?)",
      [appointmentID, status]
    );
    const [appointmentRows] = await pool.execute(
      "SELECT userID FROM appointments WHERE id = ?",
      [appointmentID]
    );
    const userID = appointmentRows[0]?.userID;
    const statusMessage =
      status === 1 ? "approved" : status === 0 ? "rejected" : "completed";

    // Notify once
    await notifyUser({
      userId: userID,
      appointmentId: appointmentID,
      message: `Your appointment has been ${statusMessage}.`,
      io,
      type: "status",
    });
    await notifyAdmins({
      appointmentId: appointmentID,
      message: `Appointment ${appointmentID} has been ${statusMessage} by admin.`,
      io,
      type: "status",
    });

    // Optionally broadcast UI event
    io.to(`user_${userID}`).emit("appointmentStatusChanged", {
      appointmentId: appointmentID,
      status,
    });
    io.to("user_admin").emit("appointmentStatusChanged", {
      appointmentId: appointmentID,
      status,
    });

    return res
      .status(200)
      .json(responseTemp(1, "Appointment status updated", result));
  } catch (error) {
    console.error("Error authorizing appointment:", error);
    return res
      .status(500)
      .json(responseTemp(0, "Failed to authorize appointment.!", null));
  }
};
