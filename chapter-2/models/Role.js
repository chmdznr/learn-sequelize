const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Role extends Model {}

  Role.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {
        read: false,
        write: false,
        delete: false,
        admin: false
      }
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'role',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  return Role;
};
