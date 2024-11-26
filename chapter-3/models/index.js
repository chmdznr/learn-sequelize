const { Sequelize } = require('sequelize');
const config = require('../config/database.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define
  }
);

// Initialize models
const Product = require('./Product')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);

// Define relationships
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId'
});

Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems'
});
OrderItem.belongsTo(Product, {
  foreignKey: 'productId'
});

module.exports = {
  sequelize,
  Sequelize,
  Product,
  Order,
  OrderItem
};
