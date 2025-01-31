const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");
const OrdersController = require('../controllers/orders');

// Get all orders
router.get('/', checkAuth, OrdersController.orders_get_all);

// Get a specific order
router.get("/:orderId",checkAuth, OrdersController.orders_get_byId);

// Create a new order
router.post("/",checkAuth, OrdersController.orders_create_new);

// Delete an order
router.delete("/:orderId",checkAuth, OrdersController.orders_delete_byId);

module.exports = router;
