const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const checkAuth = require("../middleware/check-auth");

const StudentAttendance = require("../models/studentAttendance");

router.post("/", checkAuth, (req, res, next) => {
  const studentAttendance = new StudentAttendance({
    _id: new mongoose.Types.ObjectId(),
    userId: req.body.userId,
    date: req.body.date,
    attendanceStatus: req.body.attendanceStatus,
    department: req.body.department
  });
  studentAttendance
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Handling POST requests to /attendance",
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

module.exports = router;