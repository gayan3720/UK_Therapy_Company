import pool from "../models/db.js";
import { responseTemp } from "../templates/responseTemplate.js";
import { createNotification } from "./notificationController.js";

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
    console.log(req, "req");

    const userID = req.user.id; // Assume authentication middleware sets req.user

    const [result] = await pool.execute(
      "CALL sp_appointments_getAppointmentHistoryByUserID(?)",
      [userID]
    );

    if (!result[0] || result[0].length === 0) {
      return res
        .status(200)
        .json(responseTemp(1, "No appointments found.!", []));
    }

    res
      .status(200)
      .json(responseTemp(1, "Appointments loaded successfully.!", result[0]));
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const createAppointment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      serviceID,
      timeslotID,
      paymentMethod,
      comments,
      serviceRequestedDate,
    } = req.body;

    const userID = req.user.id;

    // Create appointment
    const [appointmentResult] = await connection.execute(
      "CALL sp_appointments_createAppointment(?, ?, ?, ?, ?, ?)",
      [
        userID,
        serviceID,
        timeslotID,
        paymentMethod,
        comments,
        serviceRequestedDate,
      ]
    );

    const appointment = appointmentResult[0][0];

    // Get admin users (owners)
    const [adminRows] = await connection.query(
      "SELECT id FROM users WHERE role = 'admin'"
    );

    // Create notifications for all admins
    for (const admin of adminRows) {
      await createNotification(
        admin.id,
        appointment.id,
        `New appointment created by user ${userID} for service ${serviceID}`,
        connection
      );
    }

    await connection.commit();

    // Send confirmation email to user
    await sendAppointmentEmail(userID, appointment.id);

    res
      .status(201)
      .json(responseTemp(1, "Appointment created successfully", appointment));
  } catch (error) {
    await connection.rollback();
    console.error("Error creating appointment:", error);
    res.status(500).json(responseTemp(0, "Failed to create appointment", null));
  } finally {
    connection.release();
  }
};
