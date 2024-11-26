const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');
const { sequelize, Order, OrderItem, Product } = require('../models');

const generateProduct = () => ({
  id: uuidv4(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price()),
  stock: faker.number.int({ min: 10, max: 100 }),
  category: faker.commerce.department(),
  brand: faker.company.name(),
  specifications: {
    color: faker.color.human(),
    weight: faker.number.float({ min: 0.1, max: 10.0, precision: 0.1 }),
    dimensions: {
      length: faker.number.float({ min: 5, max: 50, precision: 0.1 }),
      width: faker.number.float({ min: 5, max: 50, precision: 0.1 }),
      height: faker.number.float({ min: 5, max: 50, precision: 0.1 })
    }
  },
  tags: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.commerce.productAdjective()),
  status: faker.helpers.arrayElement(['active', 'inactive', 'discontinued'])
});

const generateAddress = () => ({
  street: faker.location.streetAddress(),
  city: faker.location.city(),
  state: faker.location.state(),
  country: faker.location.country(),
  zipCode: faker.location.zipCode()
});

const generateCustomer = () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number()
});

const generateOrder = (products) => {
  const numItems = faker.number.int({ min: 1, max: Math.min(5, products.length) });
  const selectedProducts = faker.helpers.shuffle([...products]).slice(0, numItems);
  
  const items = selectedProducts.map(product => {
    const quantity = faker.number.int({ min: 1, max: 5 });
    const totalPrice = product.price * quantity;
    return {
      id: uuidv4(),
      productId: product.id,
      quantity,
      unitPrice: product.price,
      totalPrice,
      discount: faker.number.float({ min: 0, max: 20, precision: 0.01 })
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice - item.discount, 0);
  const orderDate = faker.date.past();

  return {
    orderNumber: `ORD-${Date.now()}-${faker.number.int({ min: 1000, max: 9999 })}`,
    status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    totalAmount,
    shippingAddress: generateAddress(),
    customerDetails: generateCustomer(),
    orderDate,
    deliveryDate: faker.helpers.maybe(() => faker.date.future({ refDate: orderDate })),
    paymentStatus: faker.helpers.arrayElement(['pending', 'paid', 'failed', 'refunded']),
    paymentMethod: faker.helpers.arrayElement(['creditCard', 'debitCard', 'paypal', 'bankTransfer']),
    items
  };
};

const seedDatabase = async () => {
  try {
    // Drop all tables and their associated indexes
    await sequelize.getQueryInterface().dropAllTables();
    console.log('All tables dropped');

    // Recreate tables with new schema
    await sequelize.sync({ force: true });
    console.log('Database tables recreated');

    // Generate and insert products
    const productData = Array.from({ length: 50 }, generateProduct);
    const products = await Product.bulkCreate(productData);
    console.log('Products seeded');

    // Generate and insert orders with items
    const orderData = Array.from({ length: 20 }, () => generateOrder(products));
    
    for (const orderInfo of orderData) {
      const { items, ...orderData } = orderInfo;
      const order = await Order.create(orderData);
      
      const orderItems = items.map(item => ({
        ...item,
        orderId: order.id
      }));
      
      await OrderItem.bulkCreate(orderItems);
    }

    console.log('Orders and items seeded');
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run seeder
seedDatabase();
