const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Advanced Query Optimization API',
      version: '1.0.0',
      description: 'API demonstrating advanced query optimization techniques with Sequelize',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./app.js'], // Path to the API docs
};

module.exports = swaggerJsdoc(options);
