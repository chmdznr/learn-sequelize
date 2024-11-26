const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        as: 'orderItems'
      });
    }
  }

  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false
    },
    specifications: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    tableName: 'product',
    modelName: 'Product',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['name'],
        name: 'idx_products_name'
      },
      {
        fields: ['category'],
        name: 'idx_products_category'
      },
      {
        fields: ['brand'],
        name: 'idx_products_brand'
      },
      {
        fields: ['status'],
        name: 'idx_products_status'
      },
      {
        fields: ['price'],
        name: 'idx_products_price'
      },
      {
        using: 'gin',
        fields: ['specifications'],
        name: 'idx_products_specifications'
      }
    ]
  });

  return Product;
};
