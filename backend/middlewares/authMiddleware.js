import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect route: only authenticated users
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    // Attach user to request
    req.user = await User.findById(decoded.userId).select("-password");
    req.userRole = decoded.role;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

// Restrict route to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: "Access forbidden: insufficient role" });
    }
    next();
  };
};
