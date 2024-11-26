require('dotenv').config();

module.exports = {
    production: {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || '10'),
            min: parseInt(process.env.DB_POOL_MIN || '2'),
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            keepAlive: true
        },
        logging: false,
        benchmark: true
    }
};
