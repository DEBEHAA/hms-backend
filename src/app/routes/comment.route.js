import express from "express";
import { protect } from "../controllers/auth.controller.js";
import {
  createComment,
  deleteComment,
  getAllComments,
  getCommentsByBlog,
  updateComment,
} from "../controllers/comment.controller.js";

const commentRouter = express.Router();

commentRouter.get("/:blogId", getCommentsByBlog);

commentRouter.route("/").get(getAllComments).post(protect, createComment);

commentRouter
  .route("/:commentId")
  .patch(protect, updateComment)
  .delete(protect, deleteComment);

export default commentRouter;
