const mongoose = require("mongoose");

const LeaveRequestSchema = new mongoose.Schema(
  {
    StartDate: { type: Date, required: true },
    EndDate: { type: Date, required: true },
    Reason: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    requestedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Custom validator for checking the difference between StartDate and EndDate
LeaveRequestSchema.path("EndDate").validate(function (value) {
  const diffInDays = (value - this.StartDate) / (1000 * 60 * 60 * 24);
  return diffInDays === 1 || diffInDays === 2;
}, "Leave request should be exactly for 1 or 2 days");

// Pre-save middleware to ensure EndDate is after StartDate
LeaveRequestSchema.pre("save", function (next) {
  if (this.EndDate <= this.StartDate) {
    return next(new Error("EndDate must be after StartDate"));
  }
  next();
});

module.exports = mongoose.model("LeaveRequest", LeaveRequestSchema);
