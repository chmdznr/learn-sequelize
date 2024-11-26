require('dotenv').config();
const express = require('express');
const { sequelize, User, Profile, Post, Role } = require('./models');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sequelize Demo API' });
});

// Create a user with profile
app.post('/users', async (req, res) => {
  try {
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      age: req.body.age,
      birthDate: req.body.birthDate,
      Profile: {
        bio: req.body.bio,
        website: req.body.website
      }
    }, {
      include: [Profile]
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Get user with profile and posts
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [Profile, Post]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Create a post for a user
app.post('/users/:id/posts', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      userId: user.id
    });

    res.json(post);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating post',
      error: error.message
    });
  }
});

// Assign role to user
app.post('/users/:id/roles', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    const role = await Role.findByPk(req.body.roleId);
    
    if (!user || !role) {
      return res.status(404).json({ message: 'User or Role not found' });
    }

    await user.addRole(role, { 
      through: { 
        grantedBy: req.body.grantedBy 
      } 
    });

    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    res.status(400).json({
      message: 'Error assigning role',
      error: error.message
    });
  }
});

// Database connection test
app.get('/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: 'Database connection has been established successfully.' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Unable to connect to the database:', 
      error: error.message 
    });
  }
});

// Start server
async function startServer() {
  try {
    // Sync all models with database without dropping tables
    await sequelize.sync({ force: false });
    console.log('Database synced successfully');

    // Check if default role exists
    const defaultRole = await Role.findOne({ where: { name: 'user' } });
    if (!defaultRole) {
      await Role.create({
        name: 'user',
        description: 'Regular user role',
        permissions: {
          read: true,
          write: true
        }
      });
      console.log('Default role created');
    }
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
