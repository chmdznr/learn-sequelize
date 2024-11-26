require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('./swaggerDef');
const routes = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Swagger setup
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Path to the API routes
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;

// Only start the server if we're not in test mode
if (process.env.NODE_ENV !== 'test') {
  const { sequelize } = require('./models');
  
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection established successfully.');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
      });
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
      process.exit(1);
    });
}

module.exports = app;
