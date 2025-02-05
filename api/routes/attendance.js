const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const checkAuth = require("../middleware/check-auth");

const StudentAttendance = require("../models/studentAttendance");
const message = require("../models/message");

// get student attendance by userId
router.get("/:userId", checkAuth, (req, res, next) => {
  const userId = req.params.userId;
  StudentAttendance.find({ userId: userId })
    .exec()
    .then(docs => {
      console.log("From database", docs);
      if (docs) {
        res.status(200).json(docs);
      } else {
        res.status(404).json({
          message: "No valid entry found for provided userId"
        });
      }
    })
    .catch(err => {
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
    department: req.body.department
  });
  studentAttendance
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        createdStudentAttendance: studentAttendance
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// get message by userId
router.get("/message/:userId", checkAuth, (req, res, next) => {
  const userId = req.params.userId;

  // Convert userId to ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  message.find({ userId: new mongoose.Types.ObjectId(userId) })
    .exec()
    .then(docs => {
      console.log("From database", docs);
      if (docs && docs.length > 0) {
        res.status(200).json(docs);
      } else {
        res.status(404).json({
          message: "No valid entry found for provided userId"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;