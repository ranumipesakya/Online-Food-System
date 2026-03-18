import express from "express";
import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  getAdminDashboard,
  getUserProfile,
  loginUser,
  registerUser,
  updateUserProfile,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getUserProfile);
userRouter.put("/profile", authMiddleware, updateUserProfile);
userRouter.get("/admin/dashboard", authMiddleware, adminAuth, getAdminDashboard);

export default userRouter;
