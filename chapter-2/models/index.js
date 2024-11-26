const { Sequelize } = require('sequelize');
const config = require('../config/database.js');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

// Initialize models
const User = require('./User')(sequelize);
const Profile = require('./Profile')(sequelize);
const Post = require('./Post')(sequelize);
const Role = require('./Role')(sequelize);
const UserRole = require('./UserRole')(sequelize);

// Define relationships
// One-to-One: User-Profile
User.hasOne(Profile, {
  foreignKey: {
    name: 'userId',
    allowNull: false
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Profile.belongsTo(User, {
  foreignKey: 'userId'
});

// One-to-Many: User-Posts
User.hasMany(Post, {
  foreignKey: {
    name: 'userId',
    allowNull: false
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Post.belongsTo(User, {
  foreignKey: 'userId'
});

// Many-to-Many: User-Roles
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'userId'
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'roleId'
});

module.exports = {
  sequelize,
  User,
  Profile,
  Post,
  Role,
  UserRole
};
