const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Comment extends Model {}

Comment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  commentableId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  commentableType: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Comment',
  indexes: [
    // Index for polymorphic queries
    {
      fields: ['commentableId', 'commentableType']
    }
  ]
});

// Helper methods for polymorphic associations
Comment.getCommentsFor = async function(model, id) {
  return await this.findAll({
    where: {
      commentableId: id,
      commentableType: model.name
    }
  });
};

module.exports = Comment;
