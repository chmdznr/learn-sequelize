const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserRole extends Model {}

  UserRole.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'role',
        key: 'id'
      }
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_role',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roleId']
      }
    ]
  });

  return UserRole;
};
