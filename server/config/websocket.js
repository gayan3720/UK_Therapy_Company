import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import pool from "../models/db.js";

export const configureWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    ws.on("message", async (message) => {
      try {
        const { token } = JSON.parse(message);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [user] = await pool.execute("CALL sp_GetUserById(?)", [
          decoded.id,
        ]);

        ws.user = user[0][0];
        ws.send(JSON.stringify({ status: "authenticated" }));
      } catch (error) {
        ws.close(1008, "Authentication failed");
      }
    });

    ws.on("message", async (message) => {
      if (!ws.user) return;

      const { chatId, content } = JSON.parse(message);
      const [result] = await pool.execute("CALL sp_InsertMessage(?, ?, ?)", [
        chatId,
        ws.user.id,
        content,
      ]);

      // Broadcast message
      wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          client.user.id === result[0][0].receiver_id
        ) {
          client.send(JSON.stringify(result[0][0]));
        }
      });
    });
  });

  return wss;
};
