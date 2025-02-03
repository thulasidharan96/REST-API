const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");


const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/check-admin");
const UserController = require("../controllers/users");

router.post("/signup", UserController.signup);

router.post("/login", UserController.login);

router.delete('/:userId', checkAuth, checkAdmin, UserController.user_delete);
module.exports = router;
