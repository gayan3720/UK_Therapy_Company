// openSwagger.js
import open from "open";

// Try to open the Swagger UI in the default browser
(async () => {
  try {
    console.log("Attempting to open Swagger UI...");
    await open("http://localhost:5000/api-docs", { app: { name: "chrome" } }); // Example for Chrome
    console.log("Swagger UI opened successfully");
  } catch (err) {
    console.error("Error opening Swagger UI:", err);
  }
})();
