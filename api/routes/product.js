const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');
const errorHandler = require('../middleware/error-handler');

const ProductsController = require('../controllers/products');

router.get('/', ProductsController.products_get_all);
router.post('/', checkAuth, ProductsController.products_create_new);
router.get('/:productId', ProductsController.products_get_by_id);
router.patch('/:productId', checkAuth, ProductsController.products_update_by_id);
router.delete('/:productId', checkAuth, ProductsController.products_delete_by_id);

// Apply error handler
router.use(errorHandler);

module.exports = router;
