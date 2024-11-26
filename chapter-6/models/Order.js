const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Order extends Model {
    static init(sequelize) {
      return super.init({
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        items: {
          type: DataTypes.JSONB,
          allowNull: false,
          validate: {
            isValidItems(value) {
              if (!Array.isArray(value)) {
                throw new Error('Items must be an array');
              }
              if (value.length === 0) {
                throw new Error('Order must contain at least one item');
              }
              const invalidItems = value.filter(item => 
                !item.productId || 
                !item.quantity || 
                item.quantity <= 0
              );
              if (invalidItems.length > 0) {
                throw new Error('Invalid items in order');
              }
            }
          }
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'pending',
          validate: {
            isIn: [['pending', 'processing', 'completed', 'cancelled']]
          }
        }
      }, {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
        timestamps: true
      });
    }

    // Instance methods for order processing
    async process() {
      try {
        await this.validate();
        await this.update({ status: 'processing' });
        // Add more processing logic here
        return true;
      } catch (error) {
        throw error;
      }
    }

    async complete() {
      if (this.status !== 'processing') {
        throw new Error('Can only complete orders that are processing');
      }
      await this.update({ status: 'completed' });
    }

    async cancel() {
      if (!['pending', 'processing'].includes(this.status)) {
        throw new Error('Can only cancel pending or processing orders');
      }
      await this.update({ status: 'cancelled' });
    }
  }

  Order.init(sequelize);

  return Order;
};
