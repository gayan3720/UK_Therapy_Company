import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Dhanu@3720",
  database: process.env.DB_NAME || "master_sports_therapy_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
export default pool;
