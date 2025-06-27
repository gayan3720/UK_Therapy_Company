import express from "express";
import {
  changePassword,
  deleteUser,
  getAllUsers,
  getUserByID,
  getUserLocationsForCompletedAppointments,
  login,
  register,
  updateUser,
  updateUserRole,
} from "../controllers/userController.js";
import { imageUpload } from "../middleware/uploadMiddleware.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
import { roles } from "../utils/enum.js";

const router = express.Router();

//public route
router.post("/login", login);

//use upload.single('image') to accept a file with field name 'image'
router.post("/register", imageUpload.single("image"), register);
router.get(
  "/getuserlocationsforcompletedappointments",
  getUserLocationsForCompletedAppointments
);
//protected routes
router.get("/:userID", getUserByID);
router.delete("/deleteuser/:userID", deleteUser);
router.put("/changepassword/:userID", authMiddleware, changePassword);
router.put("/updateuser/:userID", updateUser);
router.put("/updaterole/:userID", updateUserRole);
router.get("/", getAllUsers);

export default router;
