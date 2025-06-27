import pool from "../models/db.js";
import { responseTemp } from "../templates/responseTemplate.js";

export const getHistoryAndMarkRead = async (req, res) => {
  const userA = Number(req.params.userA);
  const userB = Number(req.params.userB);
  const ADMIN_ID = Number(process.env.ADMIN_ID || 1);
  try {
    const [rows] = await pool.execute(
      "CALL sp_messages_getHistoryAndMarkRead(?, ?, ?)",
      [userA, userB, ADMIN_ID]
    );
    const result =
      Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    res
      .status(200)
      .json(responseTemp(1, "Chat history loaded successfully.!", result));
  } catch (err) {
    res.status(500).json(responseTemp(0, "Failed to fetch messages.!", null));
  }
};

export const getChatHeadsForAdmin = async (req, res) => {
  try {
    const ADMIN_ID = Number(process.env.ADMIN_ID || 1);

    const [rows] = await pool.execute(
      "CALL sp_messages_getChatHeadsForAdmin(?)",
      [ADMIN_ID]
    );

    let result = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    if (Array.isArray(result)) {
      result.map((i) => {
        if (i.image) {
          i.imageUrl = `${baseUrl}/${i.image}`;
        }
      });
    }
    res
      .status(200)
      .json(responseTemp(1, "Chat heads loaded successfully.!", result));
  } catch (err) {
    console.error("Error in chat-heads:", err);
    res.status(500).json(responseTemp(0, "Failed to fetch chat heads.!", null));
  }
};
