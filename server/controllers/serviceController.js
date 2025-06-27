import pool from "../models/db.js";
import { responseTemp } from "../templates/responseTemplate.js";

export const createService = async (req, res) => {
  const { name, description, price, duration, createdBy } = req.body;
  let imageUrl = null;
  console.log(req.file);

  if (req.file) {
    imageUrl = `uploads/images/${req.file.filename}`;
  }
  try {
    const [result] = await pool.execute(
      "CALL sp_services_createService(?,?,?,?,?,?,?)",
      [
        name,
        imageUrl || null,
        description,
        price,
        duration,
        createdBy,
        new Date(),
      ]
    );
    const id = result[0][0].serviceID;
    res
      .status(200)
      .json(responseTemp(1, "Successfully created the service.!", id));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getAllServices = async (req, res) => {
  try {
    const [rows] = await pool.execute("CALL sp_services_getAllServices()");
    if (!rows[0].length > 0)
      return res.status(201).json(responseTemp(1, "No services found.!", []));

    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const newList = rows[0].map((i) => {
      return {
        ...i,
        imageUrl: i.image ? `${baseUrl}/${i.image}` : null,
      };
    });
    res
      .status(200)
      .json(responseTemp(1, "Successfully loaded the services.!", newList));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const updateService = async (req, res) => {
  let imageUrl;
  if (req.file) {
    imageUrl = `uploads/images/${req.file.filename}`;
  }
  console.log(imageUrl);

  const { id, name, description, price, duration, modifiedBy, image } =
    req.body;
  console.log(req.body, "req");

  try {
    const [result] = await pool.execute(
      "CALL sp_services_updateService(?,?,?,?,?,?,?,?)",
      [
        id,
        imageUrl ? imageUrl : image,
        name,
        description,
        parseFloat(price),
        parseFloat(duration),
        modifiedBy,
        new Date(),
      ]
    );
    if (result[0][0].affectedRows === 0)
      return res
        .status(201)
        .json(responseTemp(1, "Unable to update the service.!"));

    res.status(200).json(responseTemp(1, "Successfully updated the service.!"));
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!"));
  }
};

export const deleteService = async (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid user id.!" });
  }

  try {
    const [result] = await pool.execute("CALL sp_services_deleteService(?)", [
      numericId,
    ]);
    if (result[0][0].affectedRows === 0) {
      res.status(201).json(responseTemp(1, "Unable to delete service.!", null));
    } else {
      res
        .status(200)
        .json(
          responseTemp(
            1,
            "Successfully deleted the service.!",
            result[0][0].affectedRows
          )
        );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(responseTemp(0, "Internal server error.!", null));
  }
};

export const getServiceById = async (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return res.status(400).json(responseTemp(0, "Invalid service id.", null));
  }

  try {
    const [rows] = await pool.execute("CALL sp_servies_getServiceById(?)", [
      numericId,
    ]);

    if (!rows[0] || rows[0].length === 0) {
      return res.status(404).json(responseTemp(0, "Service not found.", null));
    }

    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const service = rows[0][0];
    service.imageUrl = service.image ? `${baseUrl}/${service.image}` : null;

    res
      .status(200)
      .json(responseTemp(1, "Successfully loaded the service.", service));
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    res.status(500).json(responseTemp(0, "Internal server error.", null));
  }
};
