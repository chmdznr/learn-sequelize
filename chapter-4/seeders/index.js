const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User, Product, Order, Comment } = require('../models');

const generateUser = () => ({
  id: uuidv4(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  phoneNumber: faker.phone.number('+1###########'),
  status: faker.helpers.arrayElement(['active', 'inactive'])
});

const generateProduct = () => ({
  id: uuidv4(),
  name: faker.commerce.productName(),
  price: parseFloat(faker.commerce.price()),
  category: faker.commerce.department(),
  stock: faker.number.int({ min: 0, max: 100 }),
  lastUpdated: faker.date.past()
});

const generateOrder = (userId) => ({
  id: uuidv4(),
  userId,
  totalAmount: parseFloat(faker.commerce.price({ min: 100, max: 1000 })),
  status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'cancelled']),
  orderDate: faker.date.past()
});

const generateComment = (targetId, type) => ({
  id: uuidv4(),
  content: faker.lorem.paragraph(),
  commentableId: targetId,
  commentableType: type
});

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Sync database with force option in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Syncing database...');
      await sequelize.sync({ force: true });
    }

    console.log('Generating users...');
    const users = await User.bulkCreate(
      Array.from({ length: 50 }, generateUser)
    );

    console.log('Generating products...');
    const products = await Product.bulkCreate(
      Array.from({ length: 100 }, generateProduct)
    );

    console.log('Generating orders...');
    const orders = await Order.bulkCreate(
      Array.from({ length: 200 }, () => 
        generateOrder(faker.helpers.arrayElement(users).id)
      )
    );

    console.log('Generating comments...');
    const comments = await Comment.bulkCreate([
      // Comments on products
      ...Array.from({ length: 150 }, () => 
        generateComment(
          faker.helpers.arrayElement(products).id,
          'Product'
        )
      ),
      // Comments on orders
      ...Array.from({ length: 100 }, () => 
        generateComment(
          faker.helpers.arrayElement(orders).id,
          'Order'
        )
      )
    ]);

    console.log('Database seeded successfully!');
    console.log(`Created:
      - ${users.length} users
      - ${products.length} products
      - ${orders.length} orders
      - ${comments.length} comments`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Run seeder
seedDatabase();
