const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Profile extends Model {}

  Profile.init({
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    social: {
      type: DataTypes.JSONB,
      defaultValue: {
        twitter: '',
        facebook: '',
        instagram: ''
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'profile',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      }
    ]
  });

  return Profile;
};
