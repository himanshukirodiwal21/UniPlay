// src/controllers/admin.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ⭐ Generate access and refresh tokens (Admin)
const generateAccessAndRefreshTokens = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new ApiError(500, "JWT secrets are not set in environment variables");
    }

    const payload = { id: admin._id, role: admin.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error generating access and refresh tokens");
  }
};

// ✅ Admin Registration
const registerAdmin = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already registered with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    return res.status(201).json(
      new ApiResponse(201, { id: admin._id, email: admin.email }, "Admin registered successfully")
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ✅ Admin Login
const loginAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email, role: "admin" });
    if (!admin) throw new ApiError(404, "Admin not found");

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            admin: { id: admin._id, email: admin.email, fullName: admin.fullName },
            accessToken,
            refreshToken,
          },
          "Admin logged in successfully"
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export { registerAdmin, loginAdmin };
