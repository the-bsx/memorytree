import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new ApiError(401, "No token provided");
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    // console.log("decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid Credentials");
  }
};

export default authMiddleware;
