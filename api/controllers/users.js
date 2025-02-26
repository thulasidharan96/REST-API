const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const StudentAttendance = require("../models/studentAttendance");
const LeaveRequest = require("../models/LeaveRequest");
const anouncement = require("../models/anouncement");

// Register
exports.signup = (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((existingUser) => {
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Error encrypting the password" });
        }

        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          name: req.body.name,
          email: req.body.email,
          password: hash,
          RegisterNumber: req.body.RegisterNumber,
          department: req.body.department,
          role: req.body.role,
        });

        user
          .save()
          .then((result) => {
            res.status(201).json({
              message: "User created successfully",
              createdUser: {
                email: result.email,
                id: result._id,
              },
            });
          })
          .catch((err) => {
            if (err.code === 11000) {
              const duplicateField = Object.keys(err.keyPattern)[0];
              const message =
                duplicateField === "email"
                  ? "Email already registered"
                  : "Register number already exists";
              return res.status(409).json({ error: message });
            }

            if (err.errors?.RegisterNumber) {
              return res
                .status(400)
                .json({ error: err.errors.RegisterNumber.message });
            }

            res
              .status(500)
              .json({ error: "An error occurred while creating the user" });
          });
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database query failed" });
    });
};

// Login
exports.login = (req, res) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User not found",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              userId: user[0]._id,
              email: user[0].email,
              name: user[0].name,
              role: user[0].role,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            userId: user[0]._id,
            token: token,
            name: user[0].name,
            RegisterNumber: user[0].RegisterNumber,
            department: user[0].department,
            role: user[0].role,
          });
        }
        res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

// Delete user
exports.user_delete = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Delete user
    const userDeleteResult = await User.deleteOne({ _id: userId });

    if (userDeleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete related attendance records
    const attendanceDeleteResult = await StudentAttendance.deleteMany({
      userId: userId,
    });

    res.status(200).json({
      message: "User and associated attendance records deleted",
      userDeleted: userDeleteResult.deletedCount,
      attendanceDeleted: attendanceDeleteResult.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// Leave request
exports.leaveRequest = async (req, res) => {
  try {
    const { StartDate, EndDate, Reason, userId, RegisterNumber, Department } =
      req.body;
    // console.log(req.body);

    // Validate required fields
    if (
      !StartDate ||
      !EndDate ||
      !Reason ||
      !userId ||
      !RegisterNumber ||
      !Department
    ) {
      return res.status(400).json({
        error: "All fields (StartDate, EndDate, Reason, userId) are required.",
      });
    }

    // Validate date formats
    const startDate = new Date(StartDate);
    const endDate = new Date(EndDate);
    if (isNaN(startDate) || isNaN(endDate)) {
      return res
        .status(400)
        .json({ error: "Invalid date format for StartDate or EndDate." });
    }

    // Check if EndDate is after StartDate
    if (endDate <= startDate) {
      return res
        .status(400)
        .json({ error: "EndDate must be after StartDate." });
    }

    // console.log("Decoded user data:", req.userData); // Log the decoded user data

    // Check if the user has a pending or approved leave request
    const existingLeaveRequest = await LeaveRequest.findOne({
      user: userId,
      status: { $in: ["Pending"] },
    });

    if (existingLeaveRequest) {
      return res.status(400).json({
        error: "You already have a pending leave request.",
      });
    }

    // Create a new leave request
    const leaveRequest = new LeaveRequest({
      RegisterNumber: RegisterNumber,
      Department: Department,
      StartDate: startDate,
      EndDate: endDate,
      Reason,
      user: userId,
      status: "Pending", // Initial status
      requestedAt: new Date(),
    });

    // Save the leave request to the database
    await leaveRequest.save();

    return res
      .status(201)
      .json({ message: "Leave request submitted successfully." });
  } catch (err) {
    // Log the error details for troubleshooting
    console.error("Error submitting leave request:", err);

    // Check for specific errors and provide more detailed messages
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation error: " + err.message });
    } else if (err.name === "MongoError" && err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Duplicate leave request detected." });
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};


exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await anouncement.find().sort({ date: -1 }); // Sort by latest first

    res.status(200).json({
      success: true,
      data: announcements.map((ann) => ({
        id: ann._id,
        title: ann.title,
        message: ann.announcement, // Assuming "announcement" is the correct field name
        date: ann.date,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};