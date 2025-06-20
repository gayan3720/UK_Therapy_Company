import pool from "../models/db.js";

export const createNotification = async (
  userID,
  appointmentID,
  message,
  connection = null
) => {
  const useExternalConnection = !!connection;

  try {
    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
    }

    await connection.execute(
      "CALL sp_notifications_createNotification(?, ?, ?)",
      [userID, appointmentID, message]
    );

    if (!useExternalConnection) {
      await connection.commit();
    }
  } catch (error) {
    if (!useExternalConnection) {
      await connection.rollback();
    }
    console.error("Error creating notification:", error);
    throw error;
  } finally {
    if (!useExternalConnection && connection) {
      connection.release();
    }
  }
};
