const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Content = require('./Content')(sequelize);
  
  class Video extends Content {
    get duration() {
      return this.metadata?.duration || 0;
    }
  }

  Video.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'video',
      allowNull: false,
      validate: {
        isIn: [['video']]
      }
    },
    content: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    sequelize,
    tableName: 'contents',
    modelName: 'Video',
    paranoid: true,
    timestamps: true,
    underscored: true,
    underscoredAll: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
      beforeCreate: (instance) => {
        instance.type = 'video';
      },
      beforeBulkCreate: (instances) => {
        instances.forEach(instance => {
          instance.type = 'video';
        });
      }
    }
  });

  return Video;
};
