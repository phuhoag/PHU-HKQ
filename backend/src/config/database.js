import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_SIZE || "10"),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  multipleStatements: false,
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
});

// Test connection
pool.on("connection", (connection) => {
  console.log("✅ New database connection established");
});

pool.on("error", (err) => {
  console.error("❌ Database pool error:", err.message);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection was closed");
  }
  if (err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
    console.error("Database connection had a fatal error");
  }
  if (err.code === "PROTOCOL_ENQUEUE_AFTER_CLOSE") {
    console.error("Database connection was closed");
  }
});

// Test connection on startup
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL Database successfully!");
    const result = await connection.query("SELECT 1 as test");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to MySQL Database:", error.message);
    return false;
  }
};

export default pool;
