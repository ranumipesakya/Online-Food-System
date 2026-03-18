import userModel from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default adminAuth;
