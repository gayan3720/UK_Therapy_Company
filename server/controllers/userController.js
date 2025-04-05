import dotenv from "dotenv";
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../models/db.js";
import { responseTemp } from "../templates/responseTemplate.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    //retrieve user bt username
    const [rows] = await pool.query("CALL sp_loginUser(?)", [username]);
    const user = rows[0][0];
    if (!user) {
      return res.status(404).json(responseTemp(1, "Invalid username.!", null));
    }

    //compare hashed password
    const match = await bycrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json(responseTemp(1, "Invalid password.!", null));
    }

    //generate jwt token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.roleID },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Construct the image URL if available
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    if (user.image) {
      user.imageUrl = `${baseUrl}/${user.image}`;
    }

    res.status(200).json(responseTemp(1, "Successfully logged in.!", token));
  } catch (err) {
    console.log(err);
    res.status(500).json(responseTemp(0, "Internal server error.!"));
  }
};

export const register = async (req, res) => {
  const { firstName, lastName, userName, password, email, roleID, createdBy } =
    req.body;
  // If an image was uploaded, get its relative path
  let imagePath = null;
  if (req.file) {
    // We stored file in uploads/images folder; save relative path
    imagePath = `uploads/images/${req.file.filename}`;
  }

  try {
    //check if username exist
    const [existing] = await pool.execute("CALL sp_loginUser(?)", [userName]);
    if (existing[0].length > 0) {
      return res
        .status(400)
        .json(responseTemp(1, "Username already exists.!", null));
    }

    //hash password
    const hashedPassword = await bycrypt.hash(password, saltRounds);

    const [result] = await pool.execute(
      "CALL sp_registerUser(?,?,?,?,?,?,?,?,?)",
      [
        imagePath || null,
        firstName,
        lastName,
        userName,
        hashedPassword,
        email,
        roleID,
        new Date(),
        createdBy || 0,
      ]
    );
    const userID = result[0][0].userID;
    res.status(200).json(responseTemp(1, "Successfully registered.!", userID));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getUserByID = async (req, res) => {
  const { userID } = req.params;
  try {
    const [rows] = await pool.execute("CALL sp_getUserByID(?)", [userID]);
    const user = rows[0][0];

    if (!user) {
      return res.status(404).json(responseTemp(1, "User not found.!"));
    }
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    if (user.image) {
      user.imageUrl = `${baseUrl}/${user.image}`;
    }

    res
      .status(200)
      .json(responseTemp(1, "Successfully loaded the user.!", user));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const deleteUser = async (req, res) => {
  const { userID } = req.params;
  const numericId = parseInt(userID, 10);

  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }
  try {
    await pool.execute("CALL sp_deleteUser(?)", [numericId]);
    res.status(200).json(responseTemp(1, "Successfully deleted the user.!"));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const changePassword = async (req, res) => {
  const { userID } = req.params;
  const { oldPassword, newPassword } = req.body;
  try {
    const [rows] = await pool.execute("CALL sp_getUserByID(?)", [userID]);
    const user = rows[0][0];
    if (!user) {
      return res.status(404).json(responseTemp(1, "User not found.!", null));
    }

    const isMatched = await bycrypt.compare(oldPassword, user.password);
    if (!isMatched) {
      return res
        .status(400)
        .json(responseTemp(1, "Old password is incorrect.!"));
    }
    const hashedNewPassword = await bycrypt.hash(newPassword, saltRounds);
    const [success] = await pool.execute("CALL sp_changePassword(?,?)", [
      userID,
      hashedNewPassword,
    ]);

    if (!success[0][0].affectedRows > 0) {
      res
        .status(400)
        .json(responseTemp(1, "Unable to change the password.!", null));
    }
    res
      .status(200)
      .json(responseTemp(1, "Successfully changed the password.!", 1));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const updateUser = async (req, res) => {
  const { userID } = req.params;
  const image = req.file ? req.file.path : null;

  const { userName, firstName, lastName, modifiedBy, roleID, email } = req.body;

  try {
    const [existing] = await pool.execute("CALL sp_getUserByID(?)", [userID]);
    if (!existing[0].length > 0) {
      return res.status(400).json(1, "Unable to find the user.!", null);
    }
    const [result] = await pool.execute(
      "CALL sp_updateUser(?,?,?,?,?,?,?,?,?,?,?)",
      [userID, image, userName, email, roleID, modifiedBy, firstName, lastName]
    );

    const isSuccess = result[0][0].affectedRows === 0 ? false : true;
    if (!isSuccess) {
      return res
        .status(400)
        .json(responseTemp(1, "Unable to update the user.!", null));
    }

    res.status(200),
      json(responseTemp(1, "Successfully updated the user.!", null));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error", null));
  }
};

export const updateUserRole = async (req, res) => {
  console.log(req.params, "reqparams");

  const { userID } = req.params;
  const { roleID, modifiedBy } = req.body;
  console.log(req.body);

  try {
    // Check if the user exists
    const [existing] = await pool.execute("CALL sp_getUserByID(?)", [userID]);
    if (!existing[0].length > 0) {
      return res
        .status(400)
        .json(responseTemp(1, "Unable to find the user.!", null));
    }

    // Update the user's role
    const [result] = await pool.execute("CALL sp_updateUserRole(?,?,?)", [
      userID,
      roleID,
      modifiedBy,
    ]);

    const isSuccess = result[0][0].affectedRows > 0;
    if (!isSuccess) {
      return res
        .status(400)
        .json(responseTemp(1, "Unable to update the user.!", null));
    }

    res
      .status(200)
      .json(responseTemp(1, "Successfully updated the user.!", null));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error", null));
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute("CALL sp_getAllUsers()");
    const users = rows[0];
    if (!users.length > 0) {
      return res
        .status(400)
        .json(responseTemp(1, "No records available.!", null));
    }
    res
      .status(200)
      .json(responseTemp(1, "Successfully loaded the the user.!", users));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};
