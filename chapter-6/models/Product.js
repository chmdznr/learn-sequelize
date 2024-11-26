const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = (sequelize) => {
  class Product extends Model {
    static init(sequelize) {
      const model = super.init({
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
          type: DataTypes.TEXT
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          validate: {
            async isPriceValid(value) {
              // Different validation based on product type
              if (this.type === 'subscription') {
                if (value < 0) {
                  throw new Error('Subscription price cannot be negative');
                }
              } else {
                if (value <= 0) {
                  throw new Error('Product price must be positive');
                }
              }

              // Price change validation - only check if this is an update and there's a previous price
              if (this.changed('price') && !this.isNewRecord && this.previous('price')) {
                const maxChange = this.type === 'subscription' ? 0.2 : 0.5;
                const oldPrice = this.previous('price');
                const changePercent = Math.abs(value - oldPrice) / oldPrice;
                if (changePercent > maxChange) {
                  throw new Error(`Price change cannot exceed ${maxChange * 100}%`);
                }
              }
            }
          }
        },
        stock: {
          type: DataTypes.INTEGER,
          validate: {
            async isStockValid(value) {
              // Skip stock validation for digital products
              if (this.type === 'digital') {
                return;
              }

              if (value < 0) {
                throw new Error('Stock cannot be negative');
              }
            }
          }
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isIn: [['physical', 'digital', 'subscription']]
          }
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
      }, {
        sequelize,
        tableName: 'products',
        modelName: 'Product',
        paranoid: true,
        timestamps: true,
        underscored: true,
        underscoredAll: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
      });

      return model;
    }
  }

  Product.init(sequelize);

  return Product;
};
