import mongoose from "mongoose";
import AppError from "../../utils/appError.js";
import BlogReactions from "./blogReactions.model.js";

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    publishedDate: {
      type: Date,
      required: true,
    },
    tags: [String],
    featuredImage: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Draft", "Published"],
        message: "Status can either be Draft or Published",
      },
      required: true,
      default: "Draft",
    },
    postedBy: {
      type: String,
      required: true,
      enum: {
        values: ["admin", "hospital"],
        message: "Posted by can either be admin or hospital",
      },
      default: "admin",
    },
    reactions: {
      like: {
        type: Number,
        min: 0,
        default: 0,
      },
      dislike: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.methods.reaction = async function (userId, type) {
  if (!["like", "dislike"].includes(type)) {
    throw new AppError("Invalid reaction type", 400);
  }

  const blog = this;

  const reaction = await BlogReactions.findOne({
    blog: blog._id,
    user: userId,
  });

  if (!reaction) {
    blog.reactions[type] += 1;

    await BlogReactions.create({
      blog: blog._id,
      user: userId,
      liked: type === "like",
      disliked: type === "dislike",
    });

    await blog.save();

    return blog;
  }

  const { liked, disliked } = reaction;

  reaction.liked = type === "like" && !liked;
  reaction.disliked = type === "dislike" && !disliked;

  if (type === "like") {
    blog.reactions.dislike -= disliked ? 1 : 0;
    blog.reactions.like += liked ? -1 : 1;
  } else {
    blog.reactions.like -= liked ? 1 : 0;
    blog.reactions.dislike += disliked ? -1 : 1;
  }

  await reaction.save();
  await blog.save();

  return blog;
};

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
