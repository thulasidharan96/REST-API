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

//Get User Leave Latest Stats
router.get("/leave/:userId", checkAuth, async (req, res, next) => {
  const userId = req.params.userId;

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    // Check for a pending leave request
    const pendingLeaveRequest = await LeaveRequest.findOne({
      user: new mongoose.Types.ObjectId(userId),
      status: "Pending",
    });

    // Find the most recent leave request by userId
    const recentLeaveRequest = await LeaveRequest.findOne({
      user: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    // If there is no valid entry for the provided userId
    if (!recentLeaveRequest) {
      return res.status(404).json({
        message: "No valid entry found for provided userId",
      });
    }

    // Respond with both pending leave request and recent leave request
    res.status(200).json({
      // pendingLeaveRequest: pendingLeaveRequest || null,
      recentLeaveRequest: recentLeaveRequest,
    });
  } catch (err) {
    console.error("Database query error", err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
