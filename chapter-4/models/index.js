const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');

// Import models
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const Comment = require('./Comment');

// Define associations after all models are loaded
const setupAssociations = () => {
  // Order-User associations
  Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders'
  });

  // Order-Product associations (assuming many-to-many relationship)
  Order.belongsToMany(Product, {
    through: 'OrderProducts',
    foreignKey: 'orderId',
    otherKey: 'productId',
    as: 'products'
  });

  Product.belongsToMany(Order, {
    through: 'OrderProducts',
    foreignKey: 'productId',
    otherKey: 'orderId',
    as: 'orders'
  });

  // Polymorphic associations for comments
  const commentableModels = [User, Product, Order];
  commentableModels.forEach(Model => {
    Model.hasMany(Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentableType: Model.name
      },
      as: 'comments'
    });

    Comment.belongsTo(Model, {
      foreignKey: 'commentableId',
      constraints: false,
      as: Model.name.toLowerCase()
    });
  });
};

// Setup associations
setupAssociations();

// Export models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Product,
  Order,
  Comment
};
