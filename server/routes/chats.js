import express from "express";
import {
  getChatHeadsForAdmin,
  getHistoryAndMarkRead,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/history/:userA/:userB", getHistoryAndMarkRead);
router.get("/chat-heads", getChatHeadsForAdmin);

export default router;
