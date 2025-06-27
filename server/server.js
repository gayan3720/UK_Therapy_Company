import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/user.js";
import serviceRouter from "./routes/service.js";
import appointmentRouter from "./routes/appointment.js";
import timeslotRouter from "./routes/timeslot.js";
import chatRouter from "./routes/chats.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { Server } from "socket.io";
import http from "http";
import { registerSocketHandlers } from "./socket/index.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// store io
app.set("io", io);

registerSocketHandlers(io);

// Check if the swagger.json file exists
const swaggerJsonPath = "./swagger.json";

if (fs.existsSync(swaggerJsonPath)) {
  // Load the swagger.json file if it exists
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, "utf8"));

  // Serve Swagger UI with the generated documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("Swagger documentation not found, skipping Swagger UI setup.");
}

app.use(cors());
app.use(bodyParser.json());

// Serve static files (uploads)
app.use("/uploads", express.static("uploads"));

// Mount user routes under /api/users
app.use("/api/users", userRouter);
app.use("/api/services", serviceRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/timeslots", timeslotRouter);
app.use("/api/chatoption", chatRouter);

const PORT = process.env.PORT || 5000;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
server.listen(WEBSOCKET_PORT, () => {
  console.log(`WebSocket server running on port ${WEBSOCKET_PORT}`);
});
