import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/user.js";
import serviceRouter from "./routes/service.js";
import appointmentRouter from "./routes/appointment.js";
import timeslotRouter from "./routes/timeslot.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

//If storing files locally, you might need to configure Express to serve static files
app.use("/uploads", express.static("uploads"));

// Mount user routes under /api/users
app.use("/api/users", userRouter);
app.use("/api/services", serviceRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/timeslots", timeslotRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
