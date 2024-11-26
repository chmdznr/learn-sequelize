require('dotenv').config();
const express = require('express');
const { Op } = require('sequelize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { sequelize, User, Product, Order, Comment } = require('./models');
const redisClient = require('./config/redis');
const queries = require('./queries/optimizedQueries'); // Assuming queries are in a separate file

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redis cache middleware
const cacheMiddleware = (key, expiration = 3600) => async (req, res, next) => {
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    res.sendResponse = res.json;
    res.json = (data) => {
      redisClient.setex(key, expiration, JSON.stringify(data));
      res.sendResponse(data);
    };
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to mask sensitive data
const maskSensitiveData = (req, res, next) => {
  const originalSend = res.json;
  res.json = function (data) {
    if (Array.isArray(data)) {
      data = data.map(item => maskFields(item));
    } else {
      data = maskFields(data);
    }
    return originalSend.call(this, data);
  };
  next();
};

function maskFields(obj) {
  if (obj && typeof obj === 'object') {
    const masked = { ...obj };
    if (masked.email) masked.email = masked.email.replace(/(?<=.{3}).(?=.*@)/g, '*');
    if (masked.phoneNumber) masked.phoneNumber = masked.phoneNumber.replace(/(?<=.{3}).(?=.{4})/g, '*');
    if (masked.creditCard) masked.creditCard = '****-****-****-' + masked.creditCard.slice(-4);
    return masked;
  }
  return obj;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         username:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         stock:
 *           type: integer
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *         orderDate:
 *           type: string
 *           format: date-time
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         commentableType:
 *           type: string
 *           enum: [Product, Order]
 *         commentableId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /users/large-orders:
 *   get:
 *     summary: Get users who have placed orders over a specific amount
 *     parameters:
 *       - in: query
 *         name: amount
 *         schema:
 *           type: number
 *         description: Minimum order amount
 *     responses:
 *       200:
 *         description: List of users with large orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/users/large-orders', async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount) || 1000;
    
    const users = await User.findAll({
      where: {
        id: {
          [Op.in]: sequelize.literal(`(
            SELECT DISTINCT "userId"
            FROM "Orders"
            WHERE "totalAmount" > ${amount}
          )`)
        }
      }
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products/above-average:
 *   get:
 *     summary: Get products with above-average price in their category
 *     responses:
 *       200:
 *         description: List of products with above-average prices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/products/above-average', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        price: {
          [Op.gt]: sequelize.literal(`(
            SELECT AVG(price)
            FROM "Products" AS p2
            WHERE p2.category = "Product".category
          )`)
        }
      }
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /comments/{type}/{id}:
 *   get:
 *     summary: Get comments for a specific entity (Product or Order)
 *     description: Retrieves all comments associated with a specific Product or Order
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Product, Order]
 *         description: The type of entity (Product or Order)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the entity
 *     responses:
 *       200:
 *         description: List of comments for the specified entity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: No comments found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.get('/comments/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const comments = await Comment.findAll({
      where: {
        commentableType: type,
        commentableId: id
      },
      order: [['createdAt', 'DESC']]
    });
    
    if (comments.length === 0) {
      return res.status(404).json({ error: 'No comments found' });
    }
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/cached:
 *   get:
 *     summary: Get active users with caching
 *     responses:
 *       200:
 *         description: List of active users (cached)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/users/cached', cacheMiddleware('users:active'), async (req, res) => {
  try {
    const users = await User.findAll({
      where: { status: 'active' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     summary: Get products by category with caching
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Product category
 *     responses:
 *       200:
 *         description: List of products in the category (cached)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const cacheKey = `products:category:${category}`;
    
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      return res.json(JSON.parse(cachedProducts));
    }

    const products = await Product.findAll({
      where: { category },
      order: [['price', 'ASC']]
    });

    await redisClient.setex(cacheKey, 1800, JSON.stringify(products));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     summary: Get user orders with caching
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of user orders (cached)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
app.get('/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `orders:user:${userId}`;
    
    const cachedOrders = await redisClient.get(cacheKey);
    if (cachedOrders) {
      return res.json(JSON.parse(cachedOrders));
    }

    const orders = await Order.findAll({
      where: { userId }
    });

    await redisClient.setex(cacheKey, 1800, JSON.stringify(orders));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/analyze:
 *   get:
 *     summary: Analyze order data with performance monitoring
 *     description: Retrieves orders with user and product details, intentionally slowed for demonstration
 *     responses:
 *       200:
 *         description: List of orders with related data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   status:
 *                     type: string
 *                   totalAmount:
 *                     type: number
 *                   orderDate:
 *                     type: string
 *                     format: date-time
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   products:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.get('/orders/analyze', async (req, res) => {
  try {
    const result = await sequelize.query(`
      WITH SlowOperation AS (
        SELECT pg_sleep(3)  -- Simulates 3 seconds delay
      )
      SELECT 
        o.*,
        u.id as "user.id",
        u.username as "user.username",
        u.email as "user.email",
        u."phoneNumber" as "user.phoneNumber",
        u.status as "user.status",
        p.id as "products.id",
        p.name as "products.name",
        p.price as "products.price",
        p.category as "products.category",
        p.stock as "products.stock"
      FROM "Orders" o
      CROSS JOIN SlowOperation
      INNER JOIN "Users" u ON o."userId" = u.id
      INNER JOIN "OrderProducts" op ON o.id = op."orderId"
      INNER JOIN "Products" p ON op."productId" = p.id
      WHERE o.status = 'completed'
      AND o."totalAmount" > 1000
      AND p.price > 100
      ORDER BY o."orderDate" DESC
      LIMIT 100;
    `, {
      model: sequelize.models.Order,
      mapToModel: true,
      nest: true
    });

    res.json(result);
  } catch (error) {
    console.error('Error in /orders/analyze:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products/rankings:
 *   get:
 *     summary: Get product rankings by price within categories
 *     description: Uses window functions to rank products by price within their categories and calculate average prices
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *                   price:
 *                     type: number
 *                   priceRank:
 *                     type: integer
 *                   categoryAvgPrice:
 *                     type: number
 */
app.get('/products/rankings', async (req, res) => {
  try {
    const rankings = await queries.getProductRankings();
    res.json(rankings);
  } catch (error) {
    console.error('Error getting product rankings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /categories/high-value:
 *   get:
 *     summary: Get high-value product categories
 *     description: Uses HAVING clause to find categories with total value > 1000 and at least 3 products
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   productCount:
 *                     type: integer
 *                   totalValue:
 *                     type: number
 */
app.get('/categories/high-value', async (req, res) => {
  try {
    const categories = await queries.getHighValueCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error getting high value categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /orders/summary:
 *   get:
 *     summary: Get order summary using CTE
 *     description: Uses Common Table Expression (CTE) to generate hierarchical order summary data
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   orderCount:
 *                     type: integer
 *                   totalSpent:
 *                     type: number
 *                   lastOrderDate:
 *                     type: string
 *                     format: date-time
 */
app.get('/orders/summary', async (req, res) => {
  try {
    const summary = await queries.getOrderSummaryWithCTE();
    res.json(summary);
  } catch (error) {
    console.error('Error getting order summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /orders/analytics:
 *   get:
 *     summary: Get order analytics with window functions
 *     description: Uses window partitioning to calculate running totals and moving averages
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   totalAmount:
 *                     type: number
 *                   runningTotal:
 *                     type: number
 *                   7dayMovingAverage:
 *                     type: number
 */
app.get('/orders/analytics', async (req, res) => {
  try {
    const analytics = await queries.getOrderAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting order analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
