import mongoose from "mongoose";
import AppError from "../../utils/appError.js";
import generateDayId from "../../utils/generateDayId.js";
import Doctor from "./doctor.model.js";
import Hospital from "./hospital.model.js";

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    serialNo: {
      type: Number,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    dayId: {
      type: String,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ doctor: 1, dayId: 1, serialNo: 1 }, { unique: true });

// Pre-save hook to increment the serial number
appointmentSchema.pre("save", async function (next) {
  const appointment = this;

  if (!appointment.isNew) next();

  const date = new Date(appointment.appointmentDate);

  const dayId = generateDayId(date);
  appointment.dayId = dayId;

  const doctorExists = await Doctor.exists({ _id: appointment.doctor });

  if (!doctorExists) {
    return next(new AppError("Invalid doctor ID", 404));
  }

  const hospitalExists = await Hospital.exists({ _id: appointment.hospital });

  if (!hospitalExists) {
    return next(new AppError("Invalid hospital ID", 404));
  }

  const count = await Appointment.countDocuments({
    doctor: appointment.doctor,
    dayId: dayId,
  });

  appointment.serialNo = count + 1;

  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
