const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) throw new Error("JWT_SECRET is missing in .env");

  return jwt.sign(payload, secret, { expiresIn });
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { signToken, hashPassword, verifyPassword };