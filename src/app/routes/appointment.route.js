import express from "express";
import {
  createNewAppointment,
  getAppointmentById,
  getAppointments,
} from "../controllers/appointment.controller.js";
import { protect } from "../controllers/auth.controller.js"; // Removed restrictTo import

const appointmentRouter = express.Router();

// Protect all routes
appointmentRouter.use(protect);

appointmentRouter.post("/", createNewAppointment);

appointmentRouter.get("/", getAppointments);

appointmentRouter.get("/:appointmentId", getAppointmentById);

export default appointmentRouter;
