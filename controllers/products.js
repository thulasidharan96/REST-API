const mongoose = require('mongoose');
const Product = require('../models/product');

exports.products_get_all = async (req, res) => {
    try {
        const docs = await Product.find().select('-__v').exec();
        const response = {
            count: docs.length,
            products: docs.map(doc => ({
                _id: doc._id,
                name: doc.name,
                price: doc.price
            }))
        };
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ 
            message: 'Failed to fetch products',
            error: err.message 
        });
    }
};

exports.products_get_by_id = async (req, res) => {
    try {
        const id = req.params.productId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const doc = await Product.findById(id).select('-__v').exec();
        if (!doc) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(doc);
    } catch (err) {
        res.status(500).json({ 
            message: 'Failed to fetch product',
            error: err.message 
        });
    }
};

exports.products_create_new = async (req, res) => {
    try {
        if (!req.body.name || !req.body.price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            price: req.body.price
        });

        const result = await product.save();
        res.status(201).json({
            message: 'Product created successfully',
            createdProduct: {
                _id: result._id,
                name: result.name,
                price: result.price
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Failed to create product',
            error: err.message 
        });
    }
};

exports.products_update_by_id = async (req, res) => {
    try {
        const id = req.params.productId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        if (!req.body.name || !req.body.price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        const updateOps = {
            name: req.body.name,
            price: req.body.price
        };

        const result = await Product.findOneAndUpdate(
            { _id: id },
            { $set: updateOps },
            { new: true }
        ).exec();

        if (!result) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            message: 'Product updated successfully',
            product: result
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Failed to update product',
            error: err.message 
        });
    }
};

exports.products_delete_by_id = async (req, res) => {
    try {
        const id = req.params.productId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const result = await Product.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            message: 'Product deleted successfully',
            result: result
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Failed to delete product',
            error: err.message 
        });
    }
};
