// /routes/studentAttendance.js

const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");
const StudentAttendance = require("../models/studentAttendance");
const User = require("../models/user");
const checkAuth = require("../middleware/check-auth");
const checkadmin = require("../middleware/checkadmin");

router.get("/", checkAuth, checkadmin, (req, res, next) => {
  const currentDate = moment
    .tz(new Date(), "Asia/Kolkata")
    .format("YYYY-MM-DD");

  StudentAttendance.find({ dateOnly: currentDate })
    .select(
      "userId attendanceStatus _id dateOnly department name registrationNumber"
    )
    .exec()
    .then((docs) => {
      if (!docs || docs.length === 0) {
        return res.status(404).json({
          message: "No attendance records found for today",
        });
      }

      const response = {
        count: docs.length,
        studentAttendance: docs.map((doc) => ({
          userId: doc.userId,
          attendanceStatus: doc.attendanceStatus,
          _id: doc._id,
          dateOnly: doc.dateOnly,
          department: doc.department,
          name: doc.name,
          registrationNumber: doc.registrationNumber,
        })),
      };

      res.status(200).json(response);
    })
    .catch((err) => {
      console.error("Error fetching attendance:", err);
      res.status(500).json({
        error: "Failed to fetch attendance records",
        details: err.message,
      });
    });
});

//get all Student's attendance
router.get("/all", checkAuth, checkadmin, (req, res, next) => {
  StudentAttendance.find()
    .select(
      "userId attendanceStatus _id dateOnly department name registrationNumber"
    )
    .exec()
    .then((docs) => {
      if (!docs || docs.length === 0) {
        return res.status(404).json({
          message: "No attendance records found",
        });
      }

      const response = {
        count: docs.length,
        studentAttendance: docs.map((doc) => ({
          userId: doc.userId,
          attendanceStatus: doc.attendanceStatus,
          _id: doc._id,
          dateOnly: doc.dateOnly,
          department: doc.department,
          name: doc.name,
          registrationNumber: doc.registrationNumber,
        })),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.error("Error fetching attendance:", err);
      res.status(500).json({
        error: "Failed to fetch attendance records",
        details: err.message,
      });
    });
});


//get Student's attendance by registration number
router.get("/:registrationNumber", checkAuth, checkadmin, (req, res, next) => {
  const registrationNumber = req.params.registrationNumber;

  StudentAttendance.find({ registrationNumber: registrationNumber })
    .select(
      "userId attendanceStatus _id dateOnly department name registrationNumber"
    )
    .exec()
    .then((docs) => {
      if (!docs || docs.length === 0) {
        return res.status(404).json({
          message: "No attendance records found for the given registration number",
        });
      }

      res.status(200).json({
        message: "Attendance records fetched successfully",
        records: docs,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error.message,
      });
    });
});

// Get attendance by department and date
router.get("/department/:department", checkAuth, checkadmin, (req, res, next) => {
  const department = req.params.department;
  console.log(req.params);
  
  StudentAttendance.find({ department: department }) 
    .select("userId attendanceStatus _id dateOnly department name registrationNumber")
    .exec()
    .then((docs) => {
      if (!docs || docs.length === 0) {
        return res.status(404).json({
          message: "No attendance records found for the given department",
        });
      }
      res.status(200).json({
        message: "Attendance records fetched successfully",
        records: docs,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "An error occurred while fetching attendance records",
        error: err,
      });
    });
});


// Get User Info by UserId
router.get("/search/:userId", checkAuth, checkadmin, (req, res, next) => {
  const userId = req.params.userId;
  console.log(req.params);
  
  User.find({ RegisterNumber: userId })
    .select("userId _id email department name registrationNumber")
    .exec()
    .then((docs) => {
      if (!docs || docs.length === 0) {
        return res.status(404).json({
          message: "No attendance records found for the given userId",
        });
      }
      res.status(200).json({
        message: "Attendance records fetched successfully",
        records: docs,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "An error occurred while fetching attendance records",
        error: err,
      });
    });
});


module.exports = router;
