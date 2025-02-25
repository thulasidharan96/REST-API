const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const checkAuth = require("../middleware/check-auth");

const StudentAttendance = require("../models/studentAttendance");
const message = require("../models/message");
const LeaveRequest = require("../models/LeaveRequest");

// get student attendance by userId
router.get("/:userId", checkAuth, (req, res, next) => {
  const userId = req.params.userId;
  StudentAttendance.find({ userId: userId })
    .exec()
    .then((docs) => {
      console.log("From database", docs);
      if (docs) {
        res.status(200).json(docs);
      } else {
        res.status(404).json({
          message: "No valid entry found for provided userId",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// create student attendance
router.post("/", checkAuth, (req, res, next) => {
  const studentAttendance = new StudentAttendance({
    _id: new mongoose.Types.ObjectId(),
    userId: req.body.userId,
    name: req.body.name,
    registrationNumber: req.body.registrationNumber,
    date: req.body.date,
    attendanceStatus: req.body.attendanceStatus,
    department: req.body.department,
  });
  studentAttendance
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        createdStudentAttendance: studentAttendance,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// get message by userId
router.get("/message/:userId", checkAuth, (req, res, next) => {
  const userId = req.params.userId;

  // Convert userId to ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  message
    .find({ userId: new mongoose.Types.ObjectId(userId) })
    .exec()
    .then((docs) => {
      console.log("From database", docs);
      if (docs && docs.length > 0) {
        res.status(200).json(docs);
      } else {
        res.status(404).json({
          message: "No valid entry found for provided userId",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// Get User Leave Latest Stats
router.get("/leave/:userId", checkAuth, async (req, res, next) => {
  const userId = req.params.userId;

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    // Convert userId to ObjectId for MongoDB query
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check for a pending leave request
    const pendingLeaveRequest = await LeaveRequest.findOne({
      user: userObjectId,
      status: "Pending",
    }).sort({ requestedAt: -1 }); // Get the latest pending request, if any

    // Find the most recent leave request by userId
    const recentLeaveRequest = await LeaveRequest.findOne({
      user: userObjectId,
    }).sort({ requestedAt: -1 }); // Get the most recent request

    // If there is no leave request for the provided userId
    if (!recentLeaveRequest) {
      return res.status(404).json({
        message: "No leave request found for the provided userId",
      });
    }

    // Respond with both pending leave request (if any) and recent leave request
    res.status(200).json({
      recentLeaveRequest: recentLeaveRequest,
      pendingLeaveRequest: pendingLeaveRequest || null, // Return null if no pending request
    });
  } catch (err) {
    console.error("Database query error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
