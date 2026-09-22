const jwt = require("jsonwebtoken");
const ChUser = require("../models/chUser.model");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: "JWT_SECRET is missing in server config" });
    }

    const decoded = jwt.verify(token, secret);

    const user = await ChUser.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; // attach user document
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };