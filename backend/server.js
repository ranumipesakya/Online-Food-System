import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { seedDefaultFoodsIfEmpty } from "./utils/seedFoods.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

const startServer = async () => {
  const isDbConnected = await connectDB();
  if (isDbConnected) {
    await seedDefaultFoodsIfEmpty();
  }

  app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
  });
};

startServer();
