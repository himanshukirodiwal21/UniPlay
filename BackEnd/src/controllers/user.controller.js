
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
        const ExistUser = await User.findOne({ email })
        if (ExistUser) {
            return res.status(400).json({ success: false, message: "User Already Exists Please login" })
        }
        const hashPassword = await bcrypt.hashSync(password, 10)
        const verficationCode = Math.floor(100000 + Math.random() * 90000).toString()


        const user = new User({
            email,
            password,
            fullName,
            username,
            verficationCode
        })

        await user.save()
        SendVerficationCode(user.email, verficationCode)
        return res.status(200).json({ success: true, message: "User Register Successfully", user })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "internal server error" })

    }
}

const Verifyemail = async (req, res) => {
    try {

        const { code } = req.body
        const user = await User.findOne({
            verficationCode: code
        })
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired code" })
        }

        user.isVerified = true,
            user.verficationCode = undefined;
        await user.save();
        await WelcomeEmail(user.email, user.fullName)
        return res.status(200).json({ success: true, message: "Email Verifed Successfully" })



    } catch (error) {
        return res.status(400).json({ success: false, message: "Internal Server" })
    }
}

const loginUser = asyncHandler(async (req, res) => {
    //  req body => data
    // uername or email
    // find the user
    // password check
    // access and refersh token
    // send cookie
    // send response



    const { email, username, password } = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }


    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email before login");
    }

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken,
                refreshToken
            },
                "User logged in successfully"
            )
        )


        

})

export { registerUser, loginUser, Verifyemail };
