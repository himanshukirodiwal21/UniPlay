import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { SendVerficationCode, WelcomeEmail } from "../middlewares/Email.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generatin referesh and access token")
    }
}


const registerUser = async (req, res) => {
    try {

        const { email, password, username, fullName } = req.body || {};

        if (!email || !password || !fullName || !username) {
            return res.status(400)
                .json({ success: false, message: "All fields are required" })
        }

        // ⭐ CHECK IF USER ALREADY EXISTS
        const ExistUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        })

        if (ExistUser) {
            // ⭐ NAYA LOGIC: Agar user unverified hai toh new OTP bhejo
            if (!ExistUser.isVerified) {
                // Generate new verification code
                const verficationCode = Math.floor(100000 + Math.random() * 900000).toString()
                
                // Update existing user with new OTP and password (if changed)
                ExistUser.verficationCode = verficationCode
                ExistUser.password = password // Password update (will be hashed by pre-save hook)
                
                await ExistUser.save()
                
                // Send new OTP email
                await SendVerficationCode(ExistUser.email, verficationCode)
                
                return res.status(200).json({ 
                    success: true, 
                    message: " OTP Resent to " + email + ". Please verify to continue.",
                    user: ExistUser 
                })
            }
            
            // Agar user already verified hai
            return res.status(409).json({ 
                success: false, 
                message: "User already exists and is verified. Please login." 
            })
        }

        // ⭐ NEW USER REGISTRATION
        const hashPassword = await bcrypt.hashSync(password, 10)
        const verficationCode = Math.floor(100000 + Math.random() * 900000).toString()

        const user = new User({
            email,
            password,
            fullName,
            username,
            verficationCode
        })

        await user.save()
        await SendVerficationCode(user.email, verficationCode)
        
        return res.status(200).json({ 
            success: true, 
            message: "User registered successfully. OTP sent to your email.", 
            user 
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        })
    }
}

const Verifyemail = async (req, res) => {
    try {

        const { code } = req.body
        
        if (!code) {
            return res.status(400).json({ 
                success: false, 
                message: "Verification code is required" 
            })
        }

        const user = await User.findOne({
            verficationCode: code
        })

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid or expired verification code" 
            })
        }

        user.isVerified = true
        user.verficationCode = undefined
        await user.save()
        
        await WelcomeEmail(user.email, user.fullName)
        
        return res.status(200).json({ 
            success: true, 
            message: "Email verified successfully" 
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        })
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    // ⭐ CHECK VERIFICATION STATUS - Generate new OTP for unverified users
    if (!user.isVerified) {
        // Generate and send new OTP
        const verficationCode = Math.floor(100000 + Math.random() * 900000).toString()
        user.verficationCode = verficationCode
        await user.save()
        await SendVerficationCode(user.email, verficationCode)
        
        return res.status(403).json({
            success: false,
            needsVerification: true,
            user: {
                email: user.email,
                fullName: user.fullName,
                username: user.username
            },
            message: "Account not verified. New OTP sent to your email. Please verify to continue."
        });
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                    user: loggedInUser, 
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

export { registerUser, loginUser, Verifyemail };