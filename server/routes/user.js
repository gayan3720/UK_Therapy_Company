import express from "express";
import {
  changePassword,
  deleteUser,
  getAllUsers,
  getUserByID,
  login,
  register,
  updateUser,
  updateUserRole,
} from "../controllers/userController.js";
import { imageUpload } from "../middleware/uploadMiddleware.js";
import { authMiddeware, authorizeRoles } from "../middleware/authMiddleware.js";
import { roles } from "../utils/enum.js";

const router = express.Router();

//public route
router.post("/login", login);

//use upload.single('image') to accept a file with field name 'image'
router.post("/register", imageUpload.single("image"), register);

//protected routes
router.get("/:userID", getUserByID);
router.delete("/:userID", deleteUser);
router.put("/:userID/changepassword", authMiddeware, changePassword);
router.put("/updateuser/:userID", updateUser);
router.put("/updaterole/:userID", updateUserRole);
router.get("/", getAllUsers);

export default router;
