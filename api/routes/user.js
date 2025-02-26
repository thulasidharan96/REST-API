const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/checkadmin");
const UserController = require("../controllers/users");

router.post("/signup", UserController.signup);

router.post("/login", UserController.login);

router.delete("/:userId", checkAuth, checkAdmin, UserController.user_delete);

router.post("/leave", checkAuth, UserController.leaveRequest);

router.get("/announcement", checkAuth, UserController.getAnnouncements);

module.exports = router;
