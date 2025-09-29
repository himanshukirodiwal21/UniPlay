//  user router for login , register, logout and other routes
import express from 'express'
import { Router } from "express";
import {
    registerUser,
    loginUser,
    Verifyemail
} from "../controllers/user.controller.js";
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

export default router;
