import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    foodId: { type: String, required: false },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    items: { type: [orderItemSchema], required: true },
    amount: { type: Number, required: true },
    address: { type: addressSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "out for delivery", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
