const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');

// Handle GET requests to /products
router.get('/', (req, res) => {
    Product.find()
    .select('-__v')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    _id: doc._id,
                    name: doc.name,
                    price: doc.price
                };
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        res.status(500).json({ error: err });
    });
});


// Handle POST requests to /products
router.post('/', (req, res) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Product created successfully!',
                createdProduct: {
                    _id: result._id,
                    name: result.name,
                    price: result.price
                }
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});

router.get('/:productId', (req, res) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('-__v')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    message: 'No valid entry found for provided ID'
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err });
        });
});


// Handle PATCH requests to update a product
router.patch('/:productId', (req, res) => {
    const id = req.params.productId;
    const updateOps = {
        name: req.body.name,
        price: req.body.price
    };

    Product.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product updated successfully',
                result: {
                    _id: id,
                    name: req.body.name,
                    price: req.body.price
                }
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});


// Handle DELETE requests to remove a product
router.delete('/:productId', (req, res) => {
    const id = req.params.productId;
    Product.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                result: result
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;