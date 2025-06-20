import pool from "../models/db.js";

export const registerUser = (socket, { userId }) => {
  if (!userId) return;
  const personalRoom = `user_${userId}`;
  socket.join(personalRoom);
  console.log(`Socket ${socket.id} joined personal room ${personalRoom}`);
};

// Called when a socket emits 'joinRoom'
export const joinRoom = (socket, { roomId, userId }) => {
  if (!roomId || !userId) return;
  socket.join(roomId);
  console.log(`User ${userId} joined room ${roomId}`);
};

/**
 * Handle incoming chat message:
 * - Insert into DB with roomId, senderId, receiverId, message, timestamp.
 * - Emit a `newMessage` event to the receiver’s personal room.
 * - Optionally also emit back to sender for immediate UI update.
 *
 * @param {SocketIO.Server} io
 * @param {SocketIO.Socket} socket
 * @param {Object} data
 *    data: {
 *      roomId: string,
 *      senderId: number,
 *      receiverId: number,
 *      message: string
 *    }
 */

export const handleChatMessage = async (io, socket, data) => {
  console.log(data, "data");

  const { roomId, senderId, receiverId, message } = data;
  if (!roomId || !senderId || !receiverId || !message) {
    console.warn("Invalid chatMessage payload", data);
    return;
  }
  const timestamp = new Date();
  try {
    // call stored procedure or insert
    const sql = "CALL sp_messages_InsertMessage(?, ?, ?, ?)";
    await pool.execute(sql, [roomId, senderId, receiverId, message]);
    const payload = { roomId, senderId, receiverId, message, timestamp };

    // Emit to receiver’s personal room
    const receiverRoom = `user_${receiverId}`;
    io.to(receiverRoom).emit("message", payload);
    console.log(`Emitted 'message' to ${receiverRoom}`, payload);

    // Emit back to sender’s personal room so sender UI updates immediately
    const senderRoom = `user_${senderId}`;
    io.to(senderRoom).emit("message", payload);
    console.log(`Emitted 'message' to sender room ${senderRoom}`, payload);
  } catch (err) {
    console.error("Error in handleChatMessage:", err);
  }
};

/**
 * Typing indicator: emit to the other party in the same room.
 * If you want to notify only the receiver:
 *   socket.to(`user_${receiverId}`).emit('typing', { roomId, senderId })
 */
export const handleTyping = (socket, data) => {
  const { roomId, senderId, receiverId } = data;
  if (!roomId || !senderId || !receiverId) return;
  const receiverRoom = `user_${receiverId}`;
  socket.to(receiverRoom).emit("typing", { roomId, senderId });
  console.log(`Emitted 'typing' to ${receiverRoom}`, { roomId, senderId });
};

/**
 * Clean up on disconnect if needed.
 */
export const handleDisconnect = (socket) => {
  console.log("Client disconnected:", socket.id);
};
