import express from "express";
import {
  createTimestlot,
  deleteTimeslot,
  getAllTimeslots,
  getTimeslotByID,
  getTimeslotHistory,
  updateTimeslot,
} from "../controllers/timeslotController.js";

const router = express.Router();

router.post("/getAllTimeslots", getAllTimeslots);
router.get("/getTimeslotByID/:id", getTimeslotByID);
router.get("/getTimeslotHistory", getTimeslotHistory);
router.post("/createTimeslot", createTimestlot);
router.put("/updateTimeslot/:id", updateTimeslot);
router.delete("/deleteTimeslot/:id", deleteTimeslot);

export default router;
