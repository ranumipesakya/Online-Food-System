import express from "express";
import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  getAllOrders,
  getUserOrderById,
  getUserOrders,
  placeOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.get("/user", authMiddleware, getUserOrders);
orderRouter.get("/user/:orderId", authMiddleware, getUserOrderById);
orderRouter.get("/admin", authMiddleware, adminAuth, getAllOrders);
orderRouter.put("/admin/:orderId/status", authMiddleware, adminAuth, updateOrderStatus);

export default orderRouter;
