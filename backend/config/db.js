import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("Database Connected Successfully!");
    return true;
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    return false;
  }
};
