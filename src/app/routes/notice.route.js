import express from "express";
import { protect } from "../controllers/auth.controller.js"; // Removed restrictTo import
import {
  createNewNotice,
  deleteNotice,
  getAllNotices,
  getNotice,
  updateNotice,
} from "../controllers/notice.controller.js";

const noticeRouter = express.Router();

noticeRouter.use(protect);

noticeRouter
  .route("/")
  .get(getAllNotices)
  .post(createNewNotice); // Removed restrictTo

noticeRouter
  .route("/:noticeId")
  .get(getNotice)
  .patch(updateNotice) // Removed restrictTo
  .delete(deleteNotice); // Removed restrictTo

export default noticeRouter;
