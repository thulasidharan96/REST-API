const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((existingUser) => {
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ error: "Error encrypting the password" });
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

        user.save()
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
            // Handle validation and duplicate key errors
            if (err.code === 11000) {
              const duplicateField = Object.keys(err.keyPattern)[0];
              const message = duplicateField === "email" 
                ? "Email already registered" 
                : "Register number already exists";
              return res.status(409).json({ error: message });
            }

            if (err.errors?.RegisterNumber) {
              return res.status(400).json({ error: err.errors.RegisterNumber.message });
            }

            res.status(500).json({ error: "An error occurred while creating the user" });
          });
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database query failed" });
    });
};

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
            message: "Auth successful",
            userId: user[0]._id,
            token: token,
            name: user[0].name,
            RegisterNumber: user[0].RegisterNumber,
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

exports.user_delete = (req, res) => {
  User.deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
