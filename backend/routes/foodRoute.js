import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";

const foodRouter = express.Router();

// Image storage engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

foodRouter.get("/list", listFood);
foodRouter.delete("/remove/:foodId", authMiddleware, adminAuth, removeFood);
foodRouter.post("/add", authMiddleware, adminAuth, upload.single("image"), addFood);

export default foodRouter;
