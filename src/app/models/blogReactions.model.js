import mongoose from "mongoose";

const blogReactionsSchema = mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  liked: {
    type: Boolean,
    required: true,
  },
  disliked: {
    type: Boolean,
    required: true,
  },
});

const BlogReactions = mongoose.model("BlogReactions", blogReactionsSchema);

export default BlogReactions;
