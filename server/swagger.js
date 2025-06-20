import swaggerAutogen from "swagger-autogen";
import fs from "fs";
import path from "path";

const swaggerAutogenInstance = swaggerAutogen();

// Output file where the swagger.json will be generated
const outputFile = "./swagger.json";

// Paths to your route files
const endpointsFiles = [
  "./server.js", // Include the main server.js file for route scanning
];

// Basic configuration for Swagger
const doc = {
  info: {
    title: "API Documentation for My App",
    description: "This is the API documentation for the app.",
    version: "1.0.0",
  },
  host: "localhost:5000", // Replace with your app's host
  basePath: "/",
  tags: [
    { name: "Users", description: "User-related APIs" },
    { name: "Appointments", description: "Appointment-related APIs" },
    { name: "Chats", description: "Chat-related APIs" },
    { name: "Services", description: "Service-related APIs" },
    { name: "Timeslots", description: "Timeslot-related APIs" },
  ],
};

// Generate Swagger documentation based on the route files and config
swaggerAutogenInstance(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger documentation generated!");
});
