const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {
  static associate(models) {
    // Define associations
    User.hasMany(models.Order, {
      foreignKey: 'userId',
      as: 'orders'
    });
    
    // Users can have comments (polymorphic)
    User.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentableType: 'User'
      },
      as: 'comments'
    });
  }

  // Method to mask sensitive data
  toJSON() {
    const values = Object.assign({}, this.get());
    
    if (values.email) {
      const [localPart, domain] = values.email.split('@');
      values.email = `${localPart.substring(0, 3)}${'*'.repeat(localPart.length - 3)}@${domain}`;
    }
    
    if (values.phoneNumber) {
      values.phoneNumber = values.phoneNumber.replace(/(\d{3})\d{6}(\d{3})/, '$1******$2');
    }
    
    return values;
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^\+?[\d\s-]{10,}$/
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'User'
});

module.exports = User;
