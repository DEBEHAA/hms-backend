import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import validator from "validator";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
    },
    email: {
      type: String,
      validate: {
        validator: (value) => value === "" || validator.isEmail(value),
        message: "Please provide a valid email address",
      },
      trim: true,
      lowercase: true,
    },
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required!"],
      unique: [true, "Mobile number already exists!"],
      validate: {
        validator: (value) => {
          if (value.length === 0) return true;
          return validator.isMobilePhone(value);
        },
        message: "Please provide a valid contact number",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minlength: [8, "Password must be at least 8 characters!"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Confirm password is required!"],
      validate: {
        validator: function (pswrd) {
          return pswrd === this.password;
        },
        message: "Passwords don't match!",
      },
    },
    role: {
      type: String,
      enum: {
        values: ["patient", "admin", "hospital"],
        message: "Role is either: patient, admin, or hospital",
      },
      default: "patient",
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "profileModel",
    },
    profileModel: {
      type: String,
      enum: ["Patient", "Hospital", null],
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      type: Number,
      select: false,
    },
    verificationOTPExpires: {
      type: Date,
      select: false,
    },
    resetPasswordOTP: {
      type: Number,
      select: false,
    },
    resetPasswordOTPExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ mobileNo: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;

  if (this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createVerificationOTP = async function () { // Corrected the method name
  const otp = Math.floor(100000 + Math.random() * 900000);

  this.verificationOTP = otp;
  this.verificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await this.save({ validateBeforeSave: false });

  return otp;
};

userSchema.methods.createResetPasswordOTP = async function () {
  const otp = Math.floor(100000 + Math.random() * 900000);

  this.resetPasswordOTP = otp;
  this.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await this.save({ validateBeforeSave: false });

  return otp;
};

const User = mongoose.model("User", userSchema);

export default User;
