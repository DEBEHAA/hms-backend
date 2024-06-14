import mongoose from "mongoose";

const noticeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice must have a title"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Notice must have some content"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Notice must have a start date"],
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Expired"],
      default: "Active",
    },
    audience: {
      type: String,
      required: true,
      enum: ["patient", "hospital", "all"],
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice;
