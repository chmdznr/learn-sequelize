const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Content = require('./Content')(sequelize);
  
  class Article extends Content {
    get excerpt() {
      return this.content ? this.content.substring(0, 150) + '...' : '';
    }
  }

  Article.init({
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
      defaultValue: 'article',
      allowNull: false,
      validate: {
        isIn: [['article']]
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
    modelName: 'Article',
    paranoid: true,
    timestamps: true,
    underscored: true,
    underscoredAll: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
      beforeCreate: (instance) => {
        instance.type = 'article';
      },
      beforeBulkCreate: (instances) => {
        instances.forEach(instance => {
          instance.type = 'article';
        });
      }
    }
  });

  return Article;
};
