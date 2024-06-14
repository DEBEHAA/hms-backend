import APIFeaturesQuery from "../../utils/apiFeaturesQuery.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import filterObj from "../../utils/filterObj.js";
import Appointment from "../models/appointment.model.js";

export const createNewAppointment = catchAsync(async (req, res, next) => {
  const patient = req.user._id;

  const appointmentData = filterObj(
    req.body,
    "doctor",
    "hospital",
    "appointmentDate",
    "remarks"
  );

  const appointment = await Appointment.create({
    ...appointmentData,
    patient,
  });

  res.status(201).json({
    status: "success",
    message: "Appointment created successfully",
    data: {
      appointment,
    },
  });
});

export const getAppointments = catchAsync(async (req, res, next) => {
  if (req.user.role === "patient") {
    req.query.patient = req.user._id;
  } else if (req.user.role === "hospital") {
    req.query.hospital = req.user.profile;
  }

  const features = new APIFeaturesQuery(Appointment.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const appointments = await features.query;

  res.status(200).json({
    status: "success",
    message: "Appointments fetched successfully",
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

export const getAppointmentById = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.appointmentId);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  if (
    req.user.role === "patient" &&
    appointment.patient.toString() !== req.user._id.toString()
  ) {
    return next(
      new AppError("You are not authorized to view this appointment", 403)
    );
  } else if (
    req.user.role === "hospital" &&
    appointment.hospital.toString() !== req.user.profile.toString()
  ) {
    return next(
      new AppError("You are not authorized to view this appointment", 403)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Appointment fetched successfully",
    data: {
      appointment,
    },
  });
});
