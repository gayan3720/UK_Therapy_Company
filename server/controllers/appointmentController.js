import pool from "../models/db.js";
import { responseTemp } from "../templates/responseTemplate.js";

export const getAllAppointments = async (req, res) => {
  try {
    const [result] = await pool.execute(
      "CALL sp_appointments_getAllAppointments()"
    );
    if (result[0].length === 0) {
      res.status(201).json(responseTemp(1, "No appointments found.!", []));
    } else {
      res
        .status(200)
        .json(
          responseTemp(1, "Successfully loaded the appointments.!", result[0])
        );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};
