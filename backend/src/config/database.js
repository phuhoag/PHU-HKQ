import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://hoangkimquyphu260505_db_user:phu2026@demo-mongodb.vaeuqxn.mongodb.net/ecommerce-project?appName=demo-mongodb",
    );
    console.log(" Connected to MongoDB successfully!");
  } catch (error) {
    console.log(" MongoDB connection error:", error.message);
    process.exit(1);
  }
}

export default connectDB;
