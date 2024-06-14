import { promisify } from "util";
import config from "../../config/index.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import filterObj from "../../utils/filterObj.js";
import { sendSms } from "../../utils/sendSms.js";
import Hospital from "../models/hospital.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";

// Login function that stores user information in session
export const login = catchAsync(async (req, res, next) => {
  const { mobileNo, password } = req.body;

  if (!mobileNo || !password) {
    return next(new AppError("Please provide mobile number and password!", 400));
  }

  const user = await User.findOne({ mobileNo }).select("+password").populate({
    path: "profile",
    select: "-__v -createdAt -updatedAt",
  });

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect mobile number or password!", 401));
  }

  // Store user information in session
  req.session.user = user;

  return res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Middleware to protect routes
export const protect = catchAsync(async (req, res, next) => {
  // Simple session check
  if (!req.session.user) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  req.user = req.session.user;
  next();
});

// Signup function
export const signup = catchAsync(async (req, res, next) => {
  const userData = filterObj(
    req.body,
    "name",
    "mobileNo",
    "password",
    "confirmPassword",
    "role"
  );

  if (userData.role === "hospital") {
    userData.profileModel = "Hospital";

    const newHospital = await Hospital.create({
      name: userData.name,
      contactNumber: userData.mobileNo,
    });

    userData.profile = newHospital._id;
  }

  if (userData.role === "patient") {
    userData.profileModel = "Patient";

    const newPatient = await Patient.create({
      name: userData.name,
      contactNumber: userData.mobileNo,
    });

    userData.profile = newPatient._id;
  }

  const newUser = await User.create(userData);

  await sendVerificationOTP(newUser, req, res, next);
});

// Send verification OTP
const sendVerificationOTP = async (user, req, res, next) => {
  const otp = await user.createVerificationOTP();

  // Send OTP to user's mobile number
  const message = `Your Patientoo verification code is ${otp}. This code will expire in 10 minutes.`;

  try {
    const result = await sendSms(user.mobileNo, message);

    if (result.success_message) {
      return res.status(200).json({
        status: "success",
        mobileNo: user.mobileNo,
        message: `OTP sent to ${user.mobileNo}`,
      });
    } else {
      return next(
        new AppError(
          result.error_message || "There was an error sending the OTP.",
          500
        )
      );
    }
  } catch (error) {
    console.log(error);

    return next(
      new AppError(
        "There was an error sending the OTP. Please try again later!",
        500
      )
    );
  }
};

// Resend verification OTP
export const resendVerificationOTP = async (req, res, next) => {
  const { mobileNo } = req.body;

  const user = await User.findOne({ mobileNo });

  if (!user) {
    return next(new AppError("User not found!", 400));
  }

  if (user.isVerified) {
    return next(new AppError("User already verified!", 400));
  }

  await sendVerificationOTP(user, req, res, next);
};

// Verify OTP
export const verifyOTP = catchAsync(async (req, res, next) => {
  const { mobileNo, otp } = req.body;

  const user = await User.findOne({ mobileNo }).select(
    "+verificationOTP +verificationOTPExpires"
  );

  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  if (user.isVerified) {
    return next(new AppError("User already verified!", 400));
  }

  if (user.verificationOTPExpires < Date.now()) {
    return next(new AppError("OTP expired! Please request a new OTP.", 400));
  }

  if (user.verificationOTP !== otp) {
    return next(new AppError("Invalid OTP!", 400));
  }

  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "User verified successfully!",
    isVerified: true,
  });
});

// Logout function
export const logout = catchAsync(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new AppError("There was an error logging out. Please try again later!", 500));
    }

    res.clearCookie("connect.sid");

    res.status(200).json({ status: "success", message: "Logged out successfully!" });
  });
});

// Forgot password function
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { mobileNo } = req.body;

  const user = await User.findOne({ mobileNo });

  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  const otp = await user.createResetPasswordOTP();

  // Send OTP to user's mobile number
  const message = `Your Patientoo reset password code is ${otp}. This code will expire in 10 minutes.`;

  try {
    const result = await sendSms(user.mobileNo, message);

    if (result.success_message) {
      return res.status(200).json({
        status: "success",
        mobileNo: user.mobileNo,
        message: `OTP sent to ${user.mobileNo}`,
      });
    } else {
      return next(
        new AppError(
          result.error_message || "There was an error sending the OTP.",
          500
        )
      );
    }
  } catch (error) {
    console.log(error);

    return next(
      new AppError(
        "There was an error sending the OTP. Please try again later!",
        500
      )
    );
  }
});

// Reset password function
export const resetPassword = catchAsync(async (req, res, next) => {
  const { mobileNo, otp, newPassword, confirmNewPassword } = req.body;

  const user = await User.findOne({
    mobileNo,
    resetPasswordOTP: otp,
  });

  if (!user) {
    return next(new AppError("Invalid OTP!", 400));
  }

  if (user.resetPasswordOTPExpires < Date.now()) {
    return next(new AppError("OTP expired! Please request a new OTP.", 400));
  }

  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;

  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Password reset successfully!",
  });
});

// Update password function
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new AppError("Please provide your current password and new password and confirm new password", 400));
  }

  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Your provided current password is wrong.", 401));
  }

  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Password changed successfully!",
  });
});
