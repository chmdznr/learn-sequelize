const request = require('supertest');
const app = require('../index');
const { sequelize, Article, Video, Product, Order, Content } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe('Content API', () => {
  let article;
  let video;

  beforeEach(async () => {
    // Clean up the database before each test
    await Article.destroy({ where: {}, force: true });
    await Video.destroy({ where: {}, force: true });
    
    // Create test data
    article = await Article.create({
      title: 'Test Article',
      content: 'Test content',
      type: 'article',
      description: 'Test description',
      author: 'Test Author'
    });

    video = await Video.create({
      title: 'Test Video',
      type: 'video',
      description: 'Test description',
      url: 'http://test.com/video',
      duration: 120,
      author: 'Test Author'
    });
  });

  describe('GET endpoints', () => {
    test('GET /api/content should return all content', async () => {
      const response = await request(app).get('/api/content');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.some(item => item.type === 'article')).toBe(true);
      expect(response.body.some(item => item.type === 'video')).toBe(true);
    });

    test('GET /api/content/:id should return specific content', async () => {
      const response = await request(app).get(`/api/content/${article.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(article.id);
      expect(response.body.type).toBe('article');
    });

    test('GET /api/content/:id should return 404 for non-existent content', async () => {
      const response = await request(app).get('/api/content/999');
      expect(response.status).toBe(404);
    });

    test('GET /api/content/type/:type should return content by type', async () => {
      const response = await request(app).get('/api/content/type/article');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].type).toBe('article');
    });

    test('GET /api/content with includeDeleted should return soft-deleted content', async () => {
      await article.destroy();
      const response = await request(app).get('/api/content?includeDeleted=true');
      expect(response.status).toBe(200);
      expect(response.body.some(item => item.id === article.id)).toBe(true);
    });
  });

  describe('POST endpoints', () => {
    test('POST /api/content should create new article', async () => {
      const newArticle = {
        title: 'New Article',
        content: 'New content',
        type: 'article',
        description: 'New description',
        author: 'New Author'
      };

      const response = await request(app)
        .post('/api/content')
        .send(newArticle);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newArticle.title);
      expect(response.body.type).toBe('article');
    });

    test('POST /api/content should create new video', async () => {
      const newVideo = {
        title: 'New Video',
        type: 'video',
        description: 'New description',
        url: 'http://test.com/new-video',
        duration: 180,
        author: 'New Author'
      };

      const response = await request(app)
        .post('/api/content')
        .send(newVideo);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newVideo.title);
      expect(response.body.type).toBe('video');
    });

    test('POST /api/content/articles should create new article (legacy)', async () => {
      const newArticle = {
        title: 'Legacy Article',
        content: 'Legacy content',
        description: 'Legacy description',
        author: 'Legacy Author'
      };

      const response = await request(app)
        .post('/api/content/articles')
        .send(newArticle);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newArticle.title);
      expect(response.body.type).toBe('article');
    });

    test('POST /api/content/videos should create new video (legacy)', async () => {
      const newVideo = {
        title: 'Legacy Video',
        description: 'Legacy description',
        url: 'http://test.com/legacy-video',
        duration: 240,
        author: 'Legacy Author'
      };

      const response = await request(app)
        .post('/api/content/videos')
        .send(newVideo);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newVideo.title);
      expect(response.body.type).toBe('video');
    });

    test('POST /api/content/:id/restore should restore soft-deleted content', async () => {
      // First verify the article is deleted
      await article.destroy();
      const deletedArticle = await Content.findByPk(article.id);
      expect(deletedArticle).toBeNull();

      // Restore the article
      const response = await request(app).post(`/api/content/${article.id}/restore`);
      expect(response.status).toBe(200);
      
      // Verify the article is restored
      const restoredArticle = await Content.findByPk(article.id);
      expect(restoredArticle).not.toBeNull();
      expect(restoredArticle.id).toBe(article.id);
      expect(restoredArticle.title).toBe(article.title);
    });
  });

  describe('DELETE endpoints', () => {
    test('DELETE /api/content/:id should soft delete content', async () => {
      const response = await request(app).delete(`/api/content/${article.id}`);
      expect(response.status).toBe(200);
      
      const deletedArticle = await Article.findByPk(article.id, { paranoid: false });
      expect(deletedArticle.deletedAt).not.toBeNull();
    });

    test('DELETE /api/content/:id/force should permanently delete content', async () => {
      const response = await request(app).delete(`/api/content/${article.id}/force`);
      expect(response.status).toBe(200);
      
      const deletedArticle = await Article.findByPk(article.id, { paranoid: false });
      expect(deletedArticle).toBeNull();
    });
  });

  describe('Error handling', () => {
    test('POST /api/content should return 400 for invalid content type', async () => {
      const invalidContent = {
        title: 'Invalid',
        type: 'invalid'
      };

      const response = await request(app)
        .post('/api/content')
        .send(invalidContent);

      expect(response.status).toBe(400);
    });

    test('POST /api/content/videos should return 400 for missing required fields', async () => {
      const invalidVideo = {
        title: 'Invalid Video'
        // missing url and duration
      };

      const response = await request(app)
        .post('/api/content/videos')
        .send(invalidVideo);

      expect(response.status).toBe(400);
    });
  });
});

describe('Product API', () => {
  let product;

  beforeEach(async () => {
    await Product.destroy({ where: {}, force: true });
    
    product = await Product.create({
      name: 'Test Product',
      description: 'Test description',
      price: 29.99,
      type: 'digital'
    });
  });

  test('GET /api/products should return all products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Test Product');
  });

  test('GET /api/products/:id should return specific product', async () => {
    const response = await request(app).get(`/api/products/${product.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(product.id);
  });

  test('POST /api/products should create new product', async () => {
    const newProduct = {
      name: 'New Product',
      description: 'New description',
      price: 39.99,
      type: 'digital'
    };

    const response = await request(app)
      .post('/api/products')
      .send(newProduct);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newProduct.name);
  });
});

describe('Order API', () => {
  let product;
  let order;

  beforeEach(async () => {
    await Order.destroy({ where: {}, force: true });
    await Product.destroy({ where: {}, force: true });
    
    product = await Product.create({
      name: 'Test Product',
      description: 'Test description',
      price: 29.99,
      type: 'digital'
    });

    order = await Order.create({
      items: [{ productId: product.id, quantity: 2 }],
      status: 'pending'
    });
  });

  test('GET /api/orders should return all orders', async () => {
    const response = await request(app).get('/api/orders');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].status).toBe('pending');
  });

  test('GET /api/orders/:id should return specific order', async () => {
    const response = await request(app).get(`/api/orders/${order.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(order.id);
  });

  test('POST /api/orders should create new order', async () => {
    const newOrder = {
      items: [{ productId: product.id, quantity: 1 }],
      status: 'pending'
    };

    const response = await request(app)
      .post('/api/orders')
      .send(newOrder);

    expect(response.status).toBe(201);
    expect(response.body.items[0].productId).toBe(product.id);
  });

  test('PUT /api/orders/:id/status should update order status', async () => {
    const response = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .send({ status: 'completed' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
  });
});

afterAll(async () => {
  await sequelize.close();
});
