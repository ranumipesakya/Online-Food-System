import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: {
      type: String,
      trim: true,
      required: function requiredPhoneForUser() {
        return this.role === "user";
      },
    },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
