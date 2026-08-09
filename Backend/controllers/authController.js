import crypto from "crypto";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";

export const register = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler("User already exists", 400));
    }
    if (password.length < 8 || password.length > 16) {
        return next(
            new ErrorHandler("Password must be between 8 and 16 characters",400)
        );
    }
    const user = await User.create({name,email,password,accountVerified: true,});
    sendToken(user, 201, "User registered successfully", res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(
            new ErrorHandler("Please enter email and password", 400)
        );
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 400));
    }
    sendToken(user, 200, "User logged in successfully", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
    res
        .status(200)
        .cookie("token", "", {expires: new Date(Date.now()),httpOnly: true,})
        .json({success: true,message: "Logged out successfully",});
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({success: true,user,});
});
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email,});
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false,});
    const resetPasswordUrl =
        `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message =
        generateForgotPasswordEmailTemplate(resetPasswordUrl);
    try {
        await sendEmail({email: user.email,subject: "Library Management System Password Recovery",message,});
        res.status(200).json({success: true,message: `Email sent to ${user.email} successfully`,});
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({
            validateBeforeSave: false,
        });
        return next(
            new ErrorHandler(
                error.message
                    ? error.message
                    : "Cannot send reset password token",
                500
            )
        );
    }
});
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        },
    });
    if (!user) {
        return next(
            new ErrorHandler(
                "Reset password token is invalid or has expired",
                400
            )
        );
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(
            new ErrorHandler("Passwords do not match", 400)
        );
    }
    if (
        req.body.password.length < 8 ||
        req.body.password.length > 16
    ) {
        return next(
            new ErrorHandler(
                "Password must be between 8 and 16 characters",
                400
            )
        );
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(
        user,
        200,
        "Password reset successfully",
        res
    );
});
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");
    const {
        currentPassword,
        newPassword,
        confirmNewPassword,
    } = req.body;
    if (
        !currentPassword ||
        !newPassword ||
        !confirmNewPassword
    ) {
        return next(
            new ErrorHandler("Please enter all fields", 400)
        );
    }
    const isPasswordMatched =
        await user.comparePassword(currentPassword);
    if (!isPasswordMatched) {
        return next(
            new ErrorHandler(
                "Current password is incorrect",
                400
            )
        );
    }
    if (
        newPassword.length < 8 ||
        newPassword.length > 16
    ) {
        return next(
            new ErrorHandler(
                "Password must be between 8 and 16 characters",
                400
            )
        );
    }
    if (newPassword !== confirmNewPassword) {
        return next(
            new ErrorHandler(
                "New password and confirm password do not match",
                400
            )
        );
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});