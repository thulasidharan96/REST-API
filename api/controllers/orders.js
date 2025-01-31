const mongoose = require("mongoose");
const Product = require("../models/product");
const Order = require("../models/order");


exports.orders_get_all = (req, res) => {
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
};

exports.orders_get_byId = (req, res) => {
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
};

exports.orders_create_new = (req, res) => {
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
}

exports.orders_delete_byId = (req, res) => {
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
};
