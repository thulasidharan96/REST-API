const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const checkAuth = require("../middleware/check-auth");

const StudentAttendance = require("../models/studentAttendance");

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