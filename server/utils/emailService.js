import nodemailer from "nodemailer";
import pool from "../models/db.js";

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendAppointmentEmail = async (userID, appointmentID) => {
  try {
    // Get user and appointment details
    const [userRows] = await pool.query(
      "SELECT email, firstName FROM users WHERE id = ?",
      [userID]
    );
    const [appointmentRows] = await pool.query(
      `
            SELECT a.*, s.title AS serviceName 
            FROM appointments a
            JOIN services s ON a.serviceID = s.id
            WHERE a.id = ?
        `,
      [appointmentID]
    );

    if (!userRows.length || !appointmentRows.length) return;

    const user = userRows[0];
    const appointment = appointmentRows[0];
    const formattedDate = new Date(
      appointment.serviceRequestedDate
    ).toLocaleString();

    // Email content
    const mailOptions = {
      from: `"Master Sports Therapy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Appointment Confirmation",
      html: `
                <h2>Appointment Confirmation</h2>
                <p>Hello ${user.firstName},</p>
                <p>Your appointment has been successfully booked!</p>
                <p><strong>Service:</strong> ${appointment.serviceName}</p>
                <p><strong>Date & Time:</strong> ${formattedDate}</p>
                <p><strong>Location:</strong> 148 Strand, London WC2R 1JA, UK</p>
                <p>Thank you for choosing our services!</p>
            `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending appointment email:", error);
  }
};
