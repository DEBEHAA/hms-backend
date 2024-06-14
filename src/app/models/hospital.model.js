import mongoose from "mongoose";
import validator from "validator";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => value === "" || validator.isEmail(value),
        message: "Invalid email address",
      },
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;
