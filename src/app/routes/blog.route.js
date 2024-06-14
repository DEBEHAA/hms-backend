import express from "express";
import { protect } from "../controllers/auth.controller.js"; // Removed restrictTo import
import {
  createNewBlog,
  deleteBlog,
  dislikeBlog,
  getAllBlogs,
  getAllTags,
  getBlog,
  getBlogReaction,
  likeBlog,
  updateBlog,
} from "../controllers/blog.controller.js";

const blogRouter = express.Router();

blogRouter.get("/tags", getAllTags);

blogRouter.patch("/:blogId/like", protect, likeBlog);
blogRouter.patch("/:blogId/dislike", protect, dislikeBlog);
blogRouter.get("/:blogId/reactions", protect, getBlogReaction);

blogRouter
  .route("/")
  .get(getAllBlogs)
  .post(protect, createNewBlog); // Removed restrictTo

blogRouter
  .route("/:blogId")
  .get(getBlog)
  .patch(protect, updateBlog) // Removed restrictTo
  .delete(protect, deleteBlog); // Removed restrictTo

export default blogRouter;
