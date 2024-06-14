import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photo: String,
    qualifications: String,
    about: String,
    specialities: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Speciality",
        },
      ],
      validate: {
        validator: (value) => value && value.length > 0,
        message: "At least one speciality is required!",
      },
      required: [true, "Specialities are required!"],
    },
    designation: String,
    languages: [String],
    institute: String,
    department: String,
    appointmentNo: Number,
    chamberTime: String,
    offDays: [
      {
        type: String,
        enum: {
          values: ["SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI"],
          message: "{VALUE} is not a valid day!",
        },
      },
    ],
    floorNo: String,
    roomNumber: String,
    branchNames: [String],
    bmdcNo: String,
    consulatationFee: Number,
    phone: String,
    feesToShowReport: Number,
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.pre("aggregate", function () {
  this.pipeline().unshift({
    $lookup: {
      from: "specialities",
      localField: "specialities",
      foreignField: "_id",
      as: "specialities",
    },
  });
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
