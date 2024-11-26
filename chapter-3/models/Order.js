const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Order extends Model {
    static associate(models) {
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'items'
      });
    }
  }

  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'order_number'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
      validate: {
        min: 0
      }
    },
    shippingAddress: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'shipping_address'
    },
    customerDetails: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'customer_details'
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'order_date'
    },
    deliveryDate: {
      type: DataTypes.DATE,
      field: 'delivery_date'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
      field: 'payment_status'
    },
    paymentMethod: {
      type: DataTypes.ENUM('creditCard', 'debitCard', 'paypal', 'bankTransfer'),
      allowNull: false,
      field: 'payment_method'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    tableName: 'order',
    modelName: 'Order',
    underscored: true,
    indexes: [
      {
        fields: ['order_number'],
        unique: true
      },
      {
        fields: ['status']
      },
      {
        fields: ['order_date']
      }
    ]
  });

  return Order;
};
