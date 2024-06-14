import express from "express";
import { protect } from "../controllers/auth.controller.js"; // Removed restrictTo import
import {
  getAdminHospitals,
  getHospitalById,
  getHospitals,
  updateHospital,
} from "../controllers/hospital.controller.js";

const hospitalRouter = express.Router();

hospitalRouter.get("/", getHospitals);

hospitalRouter.get("/admin", protect, getAdminHospitals); // Removed restrictTo

hospitalRouter.patch("/", protect, updateHospital); // Removed restrictTo

hospitalRouter.route("/:hospitalId").get(getHospitalById);

export default hospitalRouter;
