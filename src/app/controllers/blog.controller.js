import APIFeaturesQuery from "../../utils/apiFeaturesQuery.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import filterObj from "../../utils/filterObj.js";
import Blog from "../models/blog.model.js";
import BlogReactions from "../models/blogReactions.model.js";
import Comment from "../models/comment.model.js";

export const createNewBlog = catchAsync(async (req, res, next) => {
  const blogData = filterObj(
    req.body,
    "title",
    "content",
    "publishedDate",
    "tags",
    "featuredImage",
    "status"
  );

  blogData.author = req.user._id;
  blogData.postedBy = req.user.role;

  const newBlog = await Blog.create(blogData);

  const message =
    blogData.status === "Draft"
      ? "Blog saved successfully"
      : "Blog published successfully";

  res.status(201).json({
    status: "success",
    message,
    data: {
      blog: newBlog,
    },
  });
});

export const getAllBlogs = catchAsync(async (req, res, next) => {
  req.query.populate = "author:name|email";

  const totalFeatures = new APIFeaturesQuery(Blog.find(), req.query).filter();

  const totalBlogs = await totalFeatures.query.countDocuments();

  const features = new APIFeaturesQuery(Blog.find(), req.query)
    .filter()
    .populate()
    .sort()
    .limitFields()
    .paginate();

  const blogs = await features.query;

  res.status(200).json({
    status: "success",
    message: "Blogs fetched successfully",
    results: blogs.length,
    data: {
      totalDocs: totalBlogs,
      blogs,
    },
  });
});

export const getBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId).populate({
    path: "author",
    select: "name email",
  });

  if (!blog) {
    return next(new AppError("Blog not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Blog fetched successfully",
    data: {
      blog,
    },
  });
});

export const updateBlog = catchAsync(async (req, res, next) => {
  const blogData = filterObj(
    req.body,
    "title",
    "content",
    "publishedDate",
    "tags",
    "featuredImage",
    "status"
  );

  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(new AppError("Blog not found", 404));
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.blogId,
    blogData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Blog updated successfully",
    data: {
      blog: updatedBlog,
    },
  });
});

export const deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(new AppError("Blog not found", 404));
  }

  await Blog.findByIdAndDelete(req.params.blogId);
  await BlogReactions.deleteMany({ blog: req.params.blogId });
  await Comment.deleteMany({ blog: req.params.blogId });

  res.status(200).json({
    status: "success",
    message: "Blog deleted successfully",
    data: null,
  });
});

export const getBlogReaction = catchAsync(async (req, res, next) => {
  const reaction = await BlogReactions.findOne({
    blog: req.params.blogId,
    user: req.user._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      reaction,
    },
  });
});

export const likeBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(new AppError("Blog not found", 404));
  }

  await blog.reaction(req.user._id, "like");

  res.status(200).json({
    status: "success",
    data: null,
  });
});

export const dislikeBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(new AppError("Blog not found", 404));
  }

  await blog.reaction(req.user._id, "dislike");

  res.status(200).json({
    status: "success",
    data: null,
  });
});

export const getAllTags = catchAsync(async (req, res, next) => {
  const uniqueTags = await Blog.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: null, uniqueTags: { $addToSet: "$tags" } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ]);

  const tags = uniqueTags[0]?.uniqueTags || [];

  res.status(200).json({
    status: "success",
    message: "Tags fetched successfully",
    data: {
      tags,
    },
  });
});
