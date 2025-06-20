import express from "express";
import {
  getAllAppointments,
  getUserAppointments,
} from "../controllers/appointmentController.js";
import { authMiddeware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllAppointments);
router.get("/getUserAppointments", authMiddeware, getUserAppointments);

export default router;
