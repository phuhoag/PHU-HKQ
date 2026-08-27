import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "./config/database.js";
import mainRoutes from "./routes/index.js";
import { initSocket } from "./config/socket.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

if (process.env.FRONTEND_URL) {
  // Remove any trailing slash to ensure exact match
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
  res.json({ message: "Ecommerce API" });
});

app.use("/api", mainRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle validation errors
  if (err.status === 400) {
    return res.status(400).json({
      success: false,
      message: err.message || "Validation error",
      errors: err.errors,
    });
  }

  // Default error response
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const server = createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
  console.log(` API available at http://localhost:${port}/api`);
});
