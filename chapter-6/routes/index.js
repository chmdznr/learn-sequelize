const express = require('express');
const router = express.Router();

const contentRoutes = require('./content.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');

router.use('/content', contentRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
