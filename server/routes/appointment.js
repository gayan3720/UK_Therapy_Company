import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getUserAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllAppointments);
router.get("/getUserAppointments", authMiddleware, getUserAppointments);
router.post("/saveAppointment", authMiddleware, createAppointment);
router.put("/update", authMiddleware, updateAppointment);
router.put("/update-status", authMiddleware, updateAppointmentStatus);

export default router;
