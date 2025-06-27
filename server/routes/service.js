import express from "express";
import { imageUpload } from "../middleware/uploadMiddleware.js";
import {
  createService,
  deleteService,
  getAllServices,
  getServiceById,
  updateService,
} from "../controllers/serviceController.js";

const router = express.Router();

router.post("/", imageUpload.single("image"), createService);
router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.put("/:id", imageUpload.single("image"), updateService);
router.delete("/:id", deleteService);
export default router;
