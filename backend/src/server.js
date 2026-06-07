import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import mainRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
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

app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
  console.log(` API available at http://localhost:${port}/api`);
});
