//import usermodels
import userModel from "../models/user.model.js";

//import utilites
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
} from "../utils/generateToken.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/sendEmail.js";

//import dependenices
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//user registration logic
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required.");
  }

  // check if user already exists
  const existingUser = await userModel.existsByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  //hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // media url assigning
  let avatar_url = null;
  let avatar_public_id = null;

  //upload url if exists
  if (req.file) {
    const cloudinaryResponse = await uploadOnCloudinary(
      req.file.buffer,
      "memory-project/avatars",
    );
    if (cloudinaryResponse) {
      ((avatar_url = cloudinaryResponse.secure_url),
        (avatar_public_id = cloudinaryResponse.public_id));
    }
  }
  // generate verification token and expiry
  const emailVerificationToken = generateEmailVerificationToken();
  const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // create new user
  const newUser = await userModel.create({
    name,
    email,
    password_hash: hashedPassword,
    avatar_url,
    avatar_public_id,
    email_verification_token: emailVerificationToken,
    email_verify_token_expiry: emailVerifyExpiry,
  });

  await sendVerificationEmail(email, emailVerificationToken);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Registration sucessfull. Please check your email to verify your account ",
        newUser,
      ),
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  // validate the token
  if (!token) {
    throw new ApiError(400, "Verification Token is Required");
  }

  // find user by token
  const user = await userModel.findVerificationToken(token);

  if (!user) {
    throw new ApiError(404, "Invalid  verification token");
  }

  //check expiry
  if (user.email_verify_token_expiry < new Date()) {
    throw new ApiError(
      400,
      "Verification token expired. Please request a new one",
    );
  }

  //verify email in DB
  await userModel.verifyEmail(user.id);

  //send welcome email
  await sendWelcomeEmail(user.email, user.name);

  // return status
  return res
    .status(200)
    .json(new ApiResponse(200, "Email verified sucessfully. you can login"));
});

// resend verificationEmail logic
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  //validate email
  if (!email) {
    throw new ApiError(400, "No email found");
  }
  //find user
  const user = await userModel.findAuthByEmail(email);
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  // check if already verified
  if (user.email_verified) {
    return res.status(200).json(new ApiResponse(200, "User already verified"));
  }

  // generate token + expiry
  const emailVerificationToken = generateEmailVerificationToken();
  const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // save generated token and expiry date to Db
  await userModel.updateVerificationToken(
    user.id,
    emailVerificationToken,
    emailVerifyExpiry,
  );

  // send verification email
  await sendVerificationEmail(user.email, emailVerificationToken);

  // senc response
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Verification Email sent. please check your email"),
    );
});

// login logic
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await userModel.findAuthByEmail(email);
  if (!user || !user.is_active) {
    throw new ApiError(404, "User not found.");
  }
  if (!user.email_verified) {
    throw new ApiError(403, "Please verify your email.");
  }

  // compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(400, "Please enter the valid credentials.");
  }

  // fetch safe user details
  const userDetails = await userModel.findById(user.id);

  //generate token
  const accessToken = generateAccessToken(userDetails.id);
  const refreshToken = generateRefreshToken(userDetails.id);

  await userModel.storeRefreshToken(userDetails.id, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json(
    new ApiResponse(200, "User logged in sucessfully", {
      accessToken,
      user: userDetails,
    }),
  );
});

// logout logic
const logoutUser = asyncHandler(async (req, res) => {
  const id = req.user.id;

  await userModel.storeRefreshToken(id, null);

  res.clearCookie("refreshToken");

  return res.status(200).json(new ApiResponse(200, "User logout sucessfully"));
});

// refreshtoken generation logic
const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(400, "RefreshToken required");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // check stored token matches
  if (user.refresh_token !== refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  //generate new access token
  const accessToken = generateAccessToken(user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Token refreshed Sucessfully", { accessToken }));
});

export {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  logoutUser,
  refreshToken,
};
