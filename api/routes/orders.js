const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

// Get all orders
router.get("/", (req, res) => {
  Order.find()
    .select("-__v")
    .populate("product", "name price")
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => ({
          _id: doc._id,
          product: doc.product,
          quantity: doc.quantity,
        })),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

// Create a new order
router.post("/", (req, res) => {
  const productId = req.body.productId;
  const quantity = req.body.quantity || 1;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: productId,
        quantity: quantity,
      });
      return order.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Order created successfully",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

// Get a specific order
router.get("/:orderId", (req, res) => {
  Order.findById(req.params.orderId)
    .select("-__v")
    .populate("product", "name price")
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }
      res.status(200).json({
        order: order,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

// Delete an order
router.delete("/:orderId", (req, res) => {
  Order.findByIdAndDelete(req.params.orderId)
    .exec()
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: "Order not found",
        });
      }
      res.status(200).json({
        message: "Order deleted successfully",
        orderId: req.params.orderId,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

module.exports = router;
