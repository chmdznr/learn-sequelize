const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Create Sequelize instance with configuration
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  define: config.define,
  logging: false // Set to console.log to see SQL queries
});

// Import and initialize models
const Content = require('./Content')(sequelize);
const Article = require('./Article')(sequelize);
const Video = require('./Video')(sequelize);
const Product = require('./Product')(sequelize);
const Order = require('./Order')(sequelize);

// Set up associations
Product.hasMany(Order);
Order.belongsTo(Product);

// Export models and sequelize instance
module.exports = {
  sequelize,
  Content,
  Article,
  Video,
  Product,
  Order
};
