import APIFeaturesQuery from "../../utils/apiFeaturesQuery.js";
import catchAsync from "../../utils/catchAsync.js";
import filterObj from "../../utils/filterObj.js";
import Hospital from "../models/hospital.model.js";
import User from "../models/user.model.js";

export const updateHospital = catchAsync(async (req, res, next) => {
  const hospitalData = filterObj(
    req.body,
    "name",
    "address",
    "district",
    "email",
    "photo",
    "description",
    "website",
    "contactNo"
  );

  await Hospital.findByIdAndUpdate(req.user.profile, hospitalData, {
    new: true,
    runValidators: true,
  });

  if (hospitalData.name) {
    await User.findByIdAndUpdate(
      req.user._id,
      { name: hospitalData.name },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  const user = await User.findById(req.user._id).populate({
    path: "profile",
    select: "-__v -createdAt -updatedAt",
  });

  res.status(200).json({
    status: "success",
    message: "Hospital updated successfully!",
    data: {
      user,
    },
  });
});

export const getHospitals = catchAsync(async (req, res, next) => {
  const features = new APIFeaturesQuery(Hospital.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const hospitals = await features.query;

  res.status(200).json({
    status: "success",
    message: "Hospitals fetched successfully",
    data: {
      hospitals,
    },
  });
});

export const getAdminHospitals = catchAsync(async (req, res, next) => {
  const hospitals = await Hospital.aggregate([
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "hospital",
        as: "doctors",
      },
    },
    {
      $project: {
        name: 1,
        address: 1,
        district: 1,
        email: 1,
        contactNumber: 1,
        doctorsCount: { $size: "$doctors" },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    message: "Hospitals fetched successfully",
    data: {
      hospitals,
    },
  });
});

export const getHospitalById = catchAsync(async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.hospitalId);

  if (!hospital) {
    return next(new AppError("Hospital not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Hospital retrieved successfully",
    data: {
      hospital,
    },
  });
});
