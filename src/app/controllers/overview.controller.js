import catchAsync from "../../utils/catchAsync.js";
import Appointment from "../models/appointment.model.js";
import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";
import Doctor from "../models/doctor.model.js";
import Hospital from "../models/hospital.model.js";
import Notice from "../models/notice.model.js";
import Patient from "../models/patient.model.js";

export const getAdminOverview = catchAsync(async (req, res, next) => {
  const hospitals = await Hospital.countDocuments();
  const doctors = await Doctor.countDocuments();
  const patients = await Patient.countDocuments();
  const appointments = await Appointment.countDocuments();
  const blogs = await Blog.countDocuments();
  const notices = await Notice.countDocuments();

  res.status(200).json({
    status: "success",
    data: {
      hospitals,
      doctors,
      patients,
      appointments,
      blogs,
      notices,
    },
  });
});

export const getHospitalOverview = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.countDocuments({ hospital: req.user.profile });
  const appointments = await Appointment.countDocuments({
    hospital: req.user.profile,
  });
  const upcomingAppointments = await Appointment.countDocuments({
    hospital: req.user.profile,
    appointmentDate: { $gte: new Date() },
  });
  const blogs = await Blog.countDocuments({ author: req.user._id });
  const comments = await Comment.countDocuments({ user: req.user._id });
  const notices = await Notice.countDocuments({
    $or: [{ audience: "hospital" }, { audience: "all" }],
  });

  res.status(200).json({
    status: "success",
    data: {
      doctors,
      appointments,
      upcomingAppointments,
      blogs,
      comments,
      notices,
    },
  });
});

export const getPatientOverview = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.countDocuments({
    patient: req.user._id,
  });
  const upcomingAppointments = await Appointment.countDocuments({
    patient: req.user._id,
    appointmentDate: { $gte: new Date() },
  });
  const notices = await Notice.countDocuments({
    $or: [{ audience: "patient" }, { audience: "all" }],
  });

  res.status(200).json({
    status: "success",
    data: {
      appointments,
      upcomingAppointments,
      notices,
    },
  });
});
