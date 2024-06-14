import express from "express";
import { protect } from "../controllers/auth.controller.js"; // Removed restrictTo import
import {
  createDoctor,
  deleteDoctor,
  getAllDoctors,
  getDoctorById,
  getHospitalDoctors,
  getSpecialities,
  updateDoctor,
} from "../controllers/doctor.controller.js";

const doctorRouter = express.Router();

doctorRouter.get("/specialities", getSpecialities);

doctorRouter.get("/my-doctors", protect, getHospitalDoctors);

doctorRouter
  .route("/")
  .get(getAllDoctors)
  .post(protect, createDoctor); // Removed restrictTo

doctorRouter
  .route("/:doctorId")
  .get(getDoctorById)
  .patch(protect, updateDoctor) // Removed restrictTo
  .delete(protect, deleteDoctor); // Removed restrictTo

export default doctorRouter;
