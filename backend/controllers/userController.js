import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const isValidPhone = (phone) => /^[0-9+\-\s]{7,20}$/.test(phone);

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role: requestedRole } = req.body;
    const role = requestedRole === "admin" ? "admin" : "user";

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email and password are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email." });
    }

    if (role === "user" && !phone) {
      return res.status(400).json({ success: false, message: "Phone number is required for users." });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: "Please enter a valid phone number." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters." });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, phone, role, password: hashedPassword });
    const token = createToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    const token = createToken(user._id);
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email." });
    }

    const currentUser = await userModel.findById(req.userId).select("role");
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (currentUser.role === "user" && !phone) {
      return res.status(400).json({ success: false, message: "Phone number is required for users." });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: "Please enter a valid phone number." });
    }

    const existingUser = await userModel.findOne({ email, _id: { $ne: req.userId } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email is already in use." });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        req.userId,
        { name, email, phone: currentUser.role === "admin" ? phone || "" : phone },
        { new: true, runValidators: true }
      )
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, message: "Profile updated.", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const [usersCount, foodsCount, recentUsers] = await Promise.all([
      userModel.countDocuments(),
      foodModel.countDocuments(),
      userModel.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(6),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        usersCount,
        foodsCount,
        recentUsers,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
