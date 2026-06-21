import jwt from "jsonwebtoken";
import crypto from "node:crypto";
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_KEY, {
    expiresIn: "24h",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_KEY, {
    expiresIn: "7d",
  });
};

const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
};
