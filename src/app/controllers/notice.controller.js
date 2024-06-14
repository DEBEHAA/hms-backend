import APIFeaturesQuery from "../../utils/apiFeaturesQuery.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import filterObj from "../../utils/filterObj.js";
import Notice from "../models/notice.model.js";

export const createNewNotice = catchAsync(async (req, res, next) => {
  const noticeData = filterObj(
    req.body,
    "title",
    "content",
    "startDate",
    "endDate",
    "status",
    "audience"
  );
  noticeData.author = req.user._id;

  const notice = await Notice.create(noticeData);

  res.status(201).json({
    status: "success",
    message: "Notice created successfully",
    data: {
      notice,
    },
  });
});

export const getAllNotices = catchAsync(async (req, res, next) => {
  if (req.user.role !== "admin") {
    req.query.startDate = new Date().setHours(24, 0, 0, 0);
    req.query.audience = { $in: ["all", "hospital"] };
  }

  req.query.sort = req.query.sort || "-createdAt";

  const features = new APIFeaturesQuery(Notice.find(), req.query)
    .filter()
    .startDateFilter()
    .sort()
    .limitFields()
    .paginate();

  const notices = await features.query;

  res.status(200).json({
    status: "success",
    results: notices.length,
    message: "All notices fetched successfully",
    data: {
      notices,
    },
  });
});

export const getNotice = catchAsync(async (req, res, next) => {
  const notice = await Notice.findById(req.params.noticeId).populate({
    path: "author",
    select: "name email",
  });

  if (!notice) {
    return next(new AppError("Notice not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Notice fetched successfully",
    data: {
      notice,
    },
  });
});

export const updateNotice = catchAsync(async (req, res, next) => {
  const noticeData = filterObj(
    req.body,
    "title",
    "content",
    "startDate",
    "endDate",
    "status",
    "audience"
  );

  const notice = await Notice.findByIdAndUpdate(
    req.params.noticeId,
    noticeData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!notice) {
    return next(new AppError("Notice not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Notice updated successfully",
    data: {
      notice,
    },
  });
});

export const deleteNotice = catchAsync(async (req, res, next) => {
  const notice = await Notice.findByIdAndDelete(req.params.noticeId);

  if (!notice) {
    return next(new AppError("Notice not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Notice deleted successfully",
    data: null,
  });
});
