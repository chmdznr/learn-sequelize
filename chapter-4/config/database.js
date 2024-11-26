const { Sequelize } = require('sequelize');
require('dotenv').config();

// Define logging function separately to match Sequelize's expected signature
const customLogger = function(query, queryTime) {
  const timing = queryTime?.duration ?? queryTime ?? 0;
  if (timing > 1000) {
    console.warn('\x1b[33m%s\x1b[0m', `⚠️ SLOW QUERY (${timing}ms):`);
    console.warn(query);
    console.warn('\x1b[33m%s\x1b[0m', '='.repeat(80));
  } else {
    console.log(`[${timing}ms] ${query}`);
  }
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: customLogger,
    benchmark: true,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
