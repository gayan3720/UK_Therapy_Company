import pool from "../models/db.js";
import { responseTemp } from "../templates/responseTemplate.js";
import moment from "moment";

export const createTimestlot = async (req, res) => {
  const { dateOfTimeslots, startTime, endTime, createdBy, createdDate } =
    req.body;
  try {
    const [result] = await pool.execute(
      "CALL sp_timeslots_createTimeslot(?,?,?,?,?)",
      [dateOfTimeslots, startTime, endTime, createdBy, createdDate]
    );

    const timeSlot = result[0][0];

    if (timeSlot.affectedRows === 0) {
      return res
        .status(201)
        .json(responseTemp(1, "Already configured for timeslot.!", null));
    } else {
      return res
        .status(200)
        .json(
          responseTemp(
            1,
            "Successfully created the timeslot.!",
            timeSlot.affectedRows
          )
        );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const updateTimeslot = async (req, res) => {
  const { slotID } = req.params;
  const { dateOftimeslots, startTime, endTime, modifiedBy } = req.body;

  const numericId = parseInt(slotID, 10);

  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid user id.!" });
  }

  try {
    const [result] = await pool.execute(
      "CALL sp_timeslots_updateTimeslot(?,?,?,?,?)",
      [numericId, dateOftimeslots, startTime, endTime, modifiedBy]
    );

    const row = result[0];
    if (row.affectedRows === 0) {
      return res
        .status(201)
        .json(responseTemp(1, "Timeslot update failed.!", null));
    } else {
      return res
        .status(200)
        .json(
          responseTemp(
            1,
            "Successfully updated the timeslot.!",
            row.affectedRows
          )
        );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};
export const deleteTimeslot = async (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid user id.!" });
  }

  try {
    const [result] = await pool.execute("CALL sp_timeslots_deleteTimeslot(?)", [
      numericId,
    ]);
    const row = result[0];
    if (row.affectedRows === 0) {
      return res
        .status(201)
        .json(responseTemp(1, "Time slot delete failed.!", null));
    } else {
      return res
        .status(200)
        .json(
          responseTemp(
            1,
            "Successfully deleted the timeslot.!",
            row.affectedRows
          )
        );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getTimeslotHistory = async (req, res) => {
  try {
    const [result] = await pool.execute(
      "CALL sp_timeslots_getTimeslotsHistory()"
    );
    const timeslotHistory = result[0];
    if (timeslotHistory.length > 0) {
      return res
        .status(200)
        .json(
          responseTemp(
            1,
            "Successfully loaded the timeslots history.!",
            timeslotHistory
          )
        );
    } else {
      return res
        .status(201)
        .json(responseTemp(1, "Timeslot history not available.!", []));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getTimeslotByID = async (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid user id.!" });
  }
  try {
    const [result] = await pool.execute(
      "CALL sp_timeslots_getTimeslotByID(?)",
      [numericId]
    );

    const response = result[0][0];
    if (!response) {
      return res.status(201).json(responseTemp(1, "Timeslot not found.!", {}));
    } else {
      return res
        .status(200)
        .json(responseTemp(1, "Successfully loaded the timeslot.!", response));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getAllTimeslots = async (req, res) => {
  const { fromDate, toDate } = req.body;

  try {
    const [result] = await pool.execute(
      "CALL sp_timeslots_getAllTimeSlots(?,?)",
      [fromDate, toDate]
    );
    const rows = result[0];
    if (rows.length > 0) {
      const newList = rows.map((i) => {
        i.dateOfTimeslots = moment(i.dateOfTimeslots);
        return i;
      });

      return res
        .status(200)
        .json(responseTemp(1, "Successfully loaded the timeslots.!", newList));
    } else {
      return res
        .status(201)
        .json(responseTemp(1, "No timeslots available.!", []));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseTemp(0, "Internal server error.!", null));
  }
};
