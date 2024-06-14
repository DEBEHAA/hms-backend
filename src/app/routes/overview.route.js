import express from "express";
import { protect } from "../controllers/auth.controller.js"; // Removed restrictTo import
import {
  getAdminOverview,
  getHospitalOverview,
  getPatientOverview,
} from "../controllers/overview.controller.js";

const overviewRouter = express.Router();

overviewRouter.get("/admin", protect, getAdminOverview); // Removed restrictTo
overviewRouter.get("/hospital", protect, getHospitalOverview); // Removed restrictTo
overviewRouter.get("/patient", protect, getPatientOverview); // Removed restrictTo

export default overviewRouter;
