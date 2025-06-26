import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { responseTemp } from "../templates/responseTemplate.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

//basic authentication middleware that verifies jwt token
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded should include user id
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

/**
 * Authorization middleware generator to restrict access based on allowed roles.
 * @param  {...string} allowedRoles - List of roles allowed to access the route.
 */

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    //req.user should be set by auth middleware
    if (!req.user) {
      return res
        .status(401)
        .json(responseTemp(0, "No user authenticated.!", null));
    }

    // Assuming req.user.role holds the role (e.g., 'admin', 'subAdmin', 'user')
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(responseTemp(0, "Forbidden.!", null));
    }
    next();
  };
};
