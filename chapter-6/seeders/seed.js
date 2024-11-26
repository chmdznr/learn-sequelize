require('dotenv').config();
const { sequelize, Article, Video, Product, Order } = require('../models');

async function seed() {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Seed articles
    const articles = await Article.bulkCreate([
      {
        title: 'Understanding Single Table Inheritance',
        content: 'Single Table Inheritance (STI) is a design pattern...',
        metadata: { author: 'John Doe', tags: ['design patterns', 'inheritance'] }
      },
      {
        title: 'Advanced Sequelize Patterns',
        content: 'Learn about advanced patterns in Sequelize...',
        metadata: { author: 'Jane Smith', tags: ['sequelize', 'patterns'] }
      }
    ]);
    console.log('Articles seeded');

    // Seed videos
    const videos = await Video.bulkCreate([
      {
        title: 'STI Tutorial',
        content: 'A comprehensive tutorial on STI...',
        metadata: { duration: 360, resolution: '1080p' }
      },
      {
        title: 'Sequelize Tips and Tricks',
        content: 'Learn advanced Sequelize techniques...',
        metadata: { duration: 480, resolution: '1080p' }
      }
    ]);
    console.log('Videos seeded');

    // Seed products
    const products = await Product.bulkCreate([
      {
        name: 'Basic Course',
        price: 29.99,
        description: 'A basic course on Sequelize',
        type: 'digital'
      },
      {
        name: 'Premium Course',
        price: 99.99,
        description: 'An advanced course on Sequelize',
        type: 'subscription'
      }
    ]);
    console.log('Products seeded');

    // Seed orders
    const orders = await Order.bulkCreate([
      {
        items: [{ productId: products[0].id, quantity: 1 }],
        status: 'completed'
      },
      {
        items: [{ productId: products[1].id, quantity: 1 }],
        status: 'pending'
      }
    ]);
    console.log('Orders seeded');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
