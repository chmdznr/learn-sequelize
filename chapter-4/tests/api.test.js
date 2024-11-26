const request = require('supertest');
const { sequelize, User, Product, Order, Comment } = require('../models');
const app = require('../app');
const redisClient = require('../config/redis');

let seededData = {
  users: [],
  products: [],
  orders: [],
  comments: []
};

beforeAll(async () => {
  // Load existing seeded data for tests
  seededData.users = await User.findAll();
  seededData.products = await Product.findAll();
  seededData.orders = await Order.findAll();
  seededData.comments = await Comment.findAll();

  // Verify we have data to work with
  if (!seededData.users.length || !seededData.products.length || !seededData.orders.length) {
    throw new Error('Database is empty. Please run npm run seed first.');
  }
});

beforeEach(async () => {
  // Clear Redis cache before each test
  await redisClient.flushall();
});

afterAll(async () => {
  await sequelize.close();
  await redisClient.quit();
});

describe('API Endpoints', () => {
  describe('GET /users/large-orders', () => {
    it('should return users with orders above specified amount', async () => {
      const amount = 500;
      const response = await request(app)
        .get(`/users/large-orders?amount=${amount}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Verify each user has at least one order above the amount
      for (const user of response.body) {
        const userOrders = seededData.orders.filter(
          order => order.userId === user.id && order.totalAmount > amount
        );
        expect(userOrders.length).toBeGreaterThan(0);
      }
    });
  });

  describe('GET /products/above-average', () => {
    it('should return products with above-average price in their category', async () => {
      const response = await request(app)
        .get('/products/above-average');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Calculate average prices per category
      const categoryAverages = {};
      seededData.products.forEach(product => {
        if (!categoryAverages[product.category]) {
          categoryAverages[product.category] = {
            total: 0,
            count: 0
          };
        }
        categoryAverages[product.category].total += parseFloat(product.price);
        categoryAverages[product.category].count++;
      });

      // Verify each returned product is above its category average
      response.body.forEach(product => {
        const avgPrice = categoryAverages[product.category].total / 
                        categoryAverages[product.category].count;
        expect(parseFloat(product.price)).toBeGreaterThan(avgPrice);
      });
    });
  });

  describe('GET /comments/:type/:id', () => {
    it('should return comments for a product', async () => {
      // Find a product that has comments
      const productWithComments = seededData.products.find(product => 
        seededData.comments.some(comment => 
          comment.commentableType === 'Product' && comment.commentableId === product.id
        )
      );

      if (!productWithComments) {
        console.warn('No products with comments found in seeded data');
        return;
      }

      const response = await request(app)
        .get(`/comments/Product/${productWithComments.id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(comment => {
        expect(comment.commentableType).toBe('Product');
        expect(comment.commentableId).toBe(productWithComments.id);
      });
    });

    it('should return comments for an order', async () => {
      // Find an order that has comments
      const orderWithComments = seededData.orders.find(order => 
        seededData.comments.some(comment => 
          comment.commentableType === 'Order' && comment.commentableId === order.id
        )
      );

      if (!orderWithComments) {
        console.warn('No orders with comments found in seeded data');
        return;
      }

      const response = await request(app)
        .get(`/comments/Order/${orderWithComments.id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(comment => {
        expect(comment.commentableType).toBe('Order');
        expect(comment.commentableId).toBe(orderWithComments.id);
      });
    });

    it('should return 404 for non-existent entity', async () => {
      const response = await request(app)
        .get('/comments/Product/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No comments found');
    });
  });

  describe('GET /users/cached', () => {
    it('should return cached active users', async () => {
      // First request - should set cache
      const response1 = await request(app)
        .get('/users/cached');

      expect(response1.status).toBe(200);
      expect(Array.isArray(response1.body)).toBe(true);
      response1.body.forEach(user => {
        expect(user.status).toBe('active');
      });

      // Second request - should use cache
      const response2 = await request(app)
        .get('/users/cached');

      expect(response2.status).toBe(200);
      expect(response2.body).toEqual(response1.body);
    });
  });

  describe('GET /products/category/:category', () => {
    it('should return products in specified category', async () => {
      // Get a category that exists in our seeded data
      const existingCategory = seededData.products[0].category;
      const response = await request(app)
        .get(`/products/category/${existingCategory}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(product => {
        expect(product.category).toBe(existingCategory);
      });
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/products/category/NonExistentCategory');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /orders/analyze', () => {
    it('should return analyzed order data with proper masking', async () => {
      const response = await request(app)
        .get('/orders/analyze');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Verify data structure and masking
      response.body.forEach(order => {
        expect(order.user).toBeDefined();
        if (order.user.phoneNumber) {
          expect(order.user.phoneNumber).toMatch(/^\d{3}\*{6}\d{3}$/);
        }
        if (order.user.email) {
          expect(order.user.email).toMatch(/^[^@]{3}[*]+@/);
        }
      });
    });
  });

  describe('GET /products/rankings', () => {
    it('should return product rankings by price within categories', async () => {
      const response = await request(app)
        .get('/products/rankings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Group products by category to verify sorting
      const productsByCategory = {};
      response.body.forEach(product => {
        if (!productsByCategory[product.category]) {
          productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
      });

      // Verify products are sorted by price within each category
      Object.values(productsByCategory).forEach(products => {
        for (let i = 1; i < products.length; i++) {
          expect(parseFloat(products[i].price)).toBeLessThanOrEqual(parseFloat(products[i-1].price));
        }
      });
    });
  });

  describe('GET /orders/user/:userId', () => {
    it('should return orders for specified user', async () => {
      const testUser = seededData.users[0];
      const response = await request(app)
        .get(`/orders/user/${testUser.id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(order => {
        expect(order.userId).toBe(testUser.id);
      });
    });
  });
});
