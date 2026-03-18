import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const headerToken = req.headers.token;
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = headerToken || bearerToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. Please login." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

export default authMiddleware;
