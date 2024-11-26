require('dotenv').config();
const express = require('express');
const { Op } = require('sequelize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { sequelize, Product, Order, OrderItem } = require('./models');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         stock:
 *           type: integer
 *         category:
 *           type: string
 *         brand:
 *           type: string
 *         specifications:
 *           type: object
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, discontinued]
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         orderId:
 *           type: string
 *           format: uuid
 *         productId:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *           minimum: 1
 *         unitPrice:
 *           type: number
 *           format: float
 *         totalPrice:
 *           type: number
 *           format: float
 *         discount:
 *           type: number
 *           format: float
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         orderNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         totalAmount:
 *           type: number
 *           format: float
 *         shippingAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             zipCode:
 *               type: string
 *         customerDetails:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *         orderDate:
 *           type: string
 *           format: date-time
 *         deliveryDate:
 *           type: string
 *           format: date-time
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         paymentMethod:
 *           type: string
 *           enum: [creditCard, debitCard, paypal, bankTransfer]
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *     ProductSalesAnalysis:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           format: uuid
 *         totalQuantity:
 *           type: integer
 *         totalRevenue:
 *           type: number
 *           format: float
 *         averageDiscount:
 *           type: number
 *           format: float
 *         product:
 *           $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get products with filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Brand filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Status filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       500:
 *         description: Server error
 */
app.get('/products', async (req, res) => {
  try {
    const { 
      minPrice, 
      maxPrice, 
      category, 
      brand, 
      status,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};
    
    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Category and brand filters
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (status) where.status = status;

    // Search in name or description
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const products = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      total: products.count,
      pages: Math.ceil(products.count / limit),
      currentPage: parseInt(page),
      products: products.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/stats:
 *   get:
 *     summary: Get order statistics with revenue aggregation
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering orders (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering orders (YYYY-MM-DD)
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city in shipping address
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderStats'
 *       500:
 *         description: Server error
 */
app.get('/orders/stats', async (req, res) => {
  try {
    const { startDate, endDate, city } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate[Op.gte] = new Date(startDate);
      if (endDate) where.orderDate[Op.lte] = new Date(endDate);
    }

    // Example of querying JSONB field
    if (city) {
      where.shippingAddress = {
        [Op.contains]: { city }
      };
    }

    const orderStats = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('orderDate')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue']
      ],
      where,
      group: [sequelize.fn('DATE', sequelize.col('orderDate'))],
      order: [[sequelize.fn('DATE', sequelize.col('orderDate')), 'ASC']]
    });

    res.json(orderStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/search:
 *   get:
 *     summary: Search orders using JSONB fields
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city in shipping address
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country in shipping address
 *       - in: query
 *         name: customerEmail
 *         schema:
 *           type: string
 *         description: Filter by customer email
 *     responses:
 *       200:
 *         description: Orders matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
app.get('/orders/search', async (req, res) => {
  try {
    const { city, country, customerEmail } = req.query;
    const where = {};

    if (city) {
      where.shippingAddress = {
        [Op.contains]: { city }
      };
    }

    const orders = await Order.findAll({
      where,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'category']
        }]
      }],
      order: [['orderDate', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID with nested items and product details
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'category']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products/analysis/sales:
 *   get:
 *     summary: Get product sales analysis with quantity, revenue, and discount metrics
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Product sales analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductSalesAnalysis'
 *       500:
 *         description: Server error
 */
app.get('/products/analysis/sales', async (req, res) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue']
      ],
      include: [{
        model: Product,
        attributes: ['name', 'category', 'brand']
      }],
      group: ['productId', 'Product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 10
    });

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Advanced product search with JSONB field queries
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: minWeight
 *         schema:
 *           type: number
 *         description: Minimum weight in specifications
 *       - in: query
 *         name: maxWeight
 *         schema:
 *           type: number
 *         description: Maximum weight in specifications
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Color in specifications
 *       - in: query
 *         name: minDimensions
 *         schema:
 *           type: object
 *           properties:
 *             length:
 *               type: number
 *             width:
 *               type: number
 *             height:
 *               type: number
 *         description: Minimum dimensions (length, width, height) in specifications
 *     responses:
 *       200:
 *         description: Products matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
app.get('/products/search', async (req, res) => {
  try {
    const { minWeight, maxWeight, color, minDimensions } = req.query;
    const where = {};

    // JSONB field queries examples
    if (minWeight || maxWeight || color || minDimensions) {
      where.specifications = {};

      // Example of numeric range query in JSONB
      if (minWeight || maxWeight) {
        where.specifications = {
          ...where.specifications,
          weight: {}
        };
        if (minWeight) {
          where.specifications.weight[Op.gte] = parseFloat(minWeight);
        }
        if (maxWeight) {
          where.specifications.weight[Op.lte] = parseFloat(maxWeight);
        }
      }

      // Example of exact value match in JSONB
      if (color) {
        where.specifications = {
          ...where.specifications,
          [Op.contains]: { color }
        };
      }

      // Example of complex nested JSONB query
      if (minDimensions) {
        const dims = JSON.parse(minDimensions);
        const dimensionConditions = [];
        
        if (dims.length) {
          dimensionConditions.push(
            sequelize.literal(`(specifications->>'dimensions')::jsonb->>'length' >= '${dims.length}'`)
          );
        }
        if (dims.width) {
          dimensionConditions.push(
            sequelize.literal(`(specifications->>'dimensions')::jsonb->>'width' >= '${dims.width}'`)
          );
        }
        if (dims.height) {
          dimensionConditions.push(
            sequelize.literal(`(specifications->>'dimensions')::jsonb->>'height' >= '${dims.height}'`)
          );
        }

        if (dimensionConditions.length > 0) {
          where[Op.and] = dimensionConditions;
        }
      }
    }

    const products = await Product.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order with items using transaction
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *               - customerDetails
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - country
 *                   - zipCode
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *               customerDetails:
 *                 type: object
 *                 required:
 *                   - name
 *                   - email
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [creditCard, debitCard, paypal, bankTransfer]
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
app.post('/orders', async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { items, shippingAddress, customerDetails, paymentMethod } = req.body;

    if (!items?.length || !shippingAddress || !customerDetails || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const totalPrice = product.price * item.quantity;
      totalAmount += totalPrice;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
        discount: 0
      });

      await product.decrement('stock', { 
        by: item.quantity,
        transaction: t 
      });
    }

    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      status: 'pending',
      totalAmount,
      shippingAddress,
      customerDetails,
      paymentMethod,
      paymentStatus: 'pending',
      orderDate: new Date()
    }, { transaction: t });

    await Promise.all(orderItems.map(item =>
      OrderItem.create({
        orderId: order.id,
        ...item
      }, { transaction: t })
    ));

    await t.commit();

    const completeOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'category']
        }]
      }]
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
