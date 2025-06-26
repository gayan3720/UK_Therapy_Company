// notificationService.js
import pool from "../models/db.js";
import { emitNotificationToUser } from "../socket/socketChat.js";
import { roles } from "../utils/enum.js";

/**
 * Insert a notification record for a given user.
 * @param {number} userId - recipient user ID
 * @param {number} appointmentId - related appointment ID
 * @param {string} message - notification message
 * @param {object} [connection] - optional existing DB connection
 */
const insertNotificationRecord = async (
  userId,
  appointmentId,
  message,
  type = "general", // Default type
  isGlobal = false,
  connection = null
) => {
  let conn = connection;
  let ownConn = false;

  try {
    if (!conn) {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      ownConn = true;
    }

    await conn.execute(
      "CALL sp_notifications_createNotification(?, ?, ?, ?, ?)",
      [userId, appointmentId, message, type, isGlobal]
    );

    if (ownConn) await conn.commit();
  } catch (err) {
    if (ownConn && conn) await conn.rollback();
    console.error("Error inserting notification record:", err);
    throw err;
  } finally {
    if (ownConn && conn) conn.release();
  }
};

/**
 * Notify a single user: insert DB record, emit socket (if io provided), send email.
 * @param {object} options
 *   - userId: number
 *   - appointmentId: number
 *   - message: string
 *   - io: Socket.IO server instance (optional)
 *   - connection: existing DB connection to group inserts in same transaction (optional)
 */
export const notifyUser = async ({
  userId,
  appointmentId,
  message,
  io = null,
  connection = null,
}) => {
  // 1. Insert notification record
  await insertNotificationRecord(userId, appointmentId, message, connection);

  // 2. Emit socket event if io available
  if (io) {
    // emitNotificationToUser sends to room `user_<userId>`
    emitNotificationToUser(userId, appointmentId, message, io);
  }
};

/**
 * Notify all admins: for each admin user, insert DB notification, emit socket (if io), send email.
 * @param {object} options
 *   - appointmentId: number
 *   - message: string
 *   - io: Socket.IO server instance (optional)
 */
export const notifyAdmins = async ({ appointmentId, message, io = null }) => {
  let conn;
  try {
    // We can fetch admins in a single connection; insertion per admin can either share this connection or separate.
    // Here we fetch first, then insert in separate transactions per admin for isolation.
    conn = await pool.getConnection();
    // No need to beginTransaction if only reading
    const [adminRows] = await conn.query(
      `SELECT id, email FROM users WHERE roleID = ${roles.admin} `
    );
    conn.release();
    conn = null;

    // For each admin, insert a notification record, emit, and send email
    for (const admin of adminRows) {
      const adminId = admin.id;
      const adminMsg = message; // you can customize per admin if needed

      // Insert & emit & email. We don’t pass a shared connection here, so each insert is its own transaction.
      try {
        await notifyUser({
          userId: adminId,
          appointmentId,
          message: adminMsg,
          io,
          // no connection passed: uses its own transaction
        });
      } catch (err) {
        console.error(`Failed to notify admin ${adminId}:`, err);
        // Continue notifying other admins
      }
    }
  } catch (err) {
    if (conn) conn.release();
    console.error("Error fetching admin users for notifications:", err);
    throw err;
  }
};

export const notifyAllUsers = async ({
  appointmentId = null,
  message,
  io = null,
  type = "system", // e.g., "system", "maintenance", etc.
}) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [userRows] = await conn.query(
      `SELECT id FROM users WHERE roleID != ${roles.admin} AND roleID != ${roles.subAdmin}` // Exclude admins and sub-admins
    );
    conn.release();
    conn = null;

    for (const user of userRows) {
      const userId = user.id;

      try {
        await insertNotificationRecord(
          userId,
          appointmentId,
          message,
          type,
          true
        );
        if (io) emitNotificationToUser(userId, appointmentId, message, io);
      } catch (err) {
        console.error(`Failed to notify user ${userId}:`, err);
      }
    }
  } catch (err) {
    if (conn) conn.release();
    console.error("Error in notifyAllUsers:", err);
    throw err;
  }
};
