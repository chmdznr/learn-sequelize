const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init({
    // String types
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notNull: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isStrongPassword(value) {
          if (value.length < 8) {
            throw new Error('Password must be at least 8 characters long');
          }
          if (!/[A-Z]/.test(value)) {
            throw new Error('Password must contain at least one uppercase letter');
          }
          if (!/[a-z]/.test(value)) {
            throw new Error('Password must contain at least one lowercase letter');
          }
          if (!/[0-9]/.test(value)) {
            throw new Error('Password must contain at least one number');
          }
          if (!/[!@#$%^&*]/.test(value)) {
            throw new Error('Password must contain at least one special character (!@#$%^&*)');
          }
        }
      }
    },
    // Numeric types
    age: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 120,
        isInt: true
      }
    },
    // Date types
    birthDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString()
      }
    },
    // Boolean type
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // JSON type
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['username']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};
