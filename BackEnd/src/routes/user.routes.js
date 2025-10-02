//  user router for login , register, logout and other routes
import express from 'express'
import { Router } from "express";
import {
    registerUser,
    loginUser,
    Verifyemail,
    forgotPassword,
    resetPassword
} from "../controllers/user.controller.js";
import {User} from "../models/user.models.js";
// import { upload } from "../middlewares/multer.middleware.js"; // no longer needed
// import { verifyJWT } from "../middlewares/auth.middleware.js"; // for future use

const router = Router()

router.route("/register").post(
    registerUser
)
router.route("/verifyemail").post(
    Verifyemail
)

router.route("/login").post(loginUser)
// router.route("/logout").post(verifyJWT, logoutUser)
// router.route("/refresh-token").post(refreshAccessToken)

router.post("/forgot-password", forgotPassword);  // send OTP
router.post("/reset-password", resetPassword);    // verify OTP + set new password


export default router;
