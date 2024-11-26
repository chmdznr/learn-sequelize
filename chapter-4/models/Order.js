const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Order extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
}

Order.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    index: true // Index for user's order history queries
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
    defaultValue: 'pending',
    index: true // Index for status filtering
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    index: true // Index for date range queries
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'Orders',
  indexes: [
    // Composite index for user's order history with date
    {
      fields: ['userId', 'orderDate']
    },
    // Composite index for status filtering with date
    {
      fields: ['status', 'orderDate']
    }
  ]
});

module.exports = Order;
