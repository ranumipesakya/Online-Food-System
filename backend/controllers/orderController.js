import orderModel from "../models/orderModel.js";

const VALID_STATUSES = ["pending", "confirmed", "preparing", "out for delivery", "delivered"];

export const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required." });
    }

    if (!address) {
      return res.status(400).json({ success: false, message: "Delivery address is required." });
    }

    const order = await orderModel.create({
      userId: req.userId,
      items,
      amount,
      address,
      status: "pending",
    });

    return res.status(201).json({ success: true, message: "Order placed.", order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrderById = async (req, res) => {
  try {
    const order = await orderModel.findOne({ _id: req.params.orderId, userId: req.userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status." });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, message: "Order status updated.", order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
