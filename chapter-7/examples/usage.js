const { Sequelize } = require('sequelize');
const DatabaseConnectionManager = require('../src/database/connectionManager');
const DatabaseErrorHandler = require('../src/middleware/errorHandler');
const DatabaseMonitor = require('../src/monitoring/databaseMonitor');
const QueryOptimizer = require('../src/services/queryOptimizer');
require('dotenv').config();

// Define a sample User model
const defineUserModel = (sequelize) => {
    return sequelize.define('User', {
        name: Sequelize.STRING,
        email: {
            type: Sequelize.STRING,
            unique: true
        },
        status: Sequelize.STRING
    }, {
        paranoid: true // Enable soft deletes
    });
};

async function runExample() {
    // Initialize Sequelize
    const sequelize = new Sequelize({
        dialect: process.env.DB_DIALECT,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    try {
        // 1. Database Connection Management
        const connectionManager = new DatabaseConnectionManager(sequelize);
        await connectionManager.connect();
        console.log('\n1. Database connection established successfully');

        // Initialize User model
        const User = defineUserModel(sequelize);
        await sequelize.sync({ force: true }); // This will recreate the table

        // 2. Database Monitoring
        const monitor = new DatabaseMonitor(sequelize);
        monitor.setupQueryLogging();
        console.log('\n2. Database monitoring initialized');

        // 3. Query Optimization Example
        console.log('\n3. Query Optimization Example:');
        
        // Insert sample data
        await User.bulkCreate([
            { name: 'John Doe', email: 'john@example.com', status: 'active' },
            { name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
            { name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive' }
        ]);

        // Use QueryOptimizer for paginated search
        const searchResult = await QueryOptimizer.findWithPagination(User, {
            page: 1,
            pageSize: 2,
            where: {
                status: 'active'
            }
        });

        console.log('Paginated search result:', JSON.stringify(searchResult, null, 2));

        // 4. Error Handling Example
        console.log('\n4. Error Handling Example:');
        
        try {
            // Try to create a user with duplicate email
            await User.create({
                name: 'Another John',
                email: 'john@example.com', // This will cause a unique constraint error
                status: 'active'
            });
        } catch (error) {
            const errorResponse = DatabaseErrorHandler.handle(error);
            console.log('Error handled:', errorResponse);
        }

        // 5. Monitor Metrics
        console.log('\n5. Database Metrics:');
        const metrics = await monitor.getMetrics();
        console.log(JSON.stringify(metrics, null, 2));

        // 6. Connection Health Check
        console.log('\n6. Connection Health Check:');
        const isHealthy = await connectionManager.healthCheck();
        console.log('Database health status:', isHealthy);

    } catch (error) {
        console.error('Example failed:', error);
        const errorResponse = DatabaseErrorHandler.handle(error);
        console.log('Error handled:', errorResponse);
    } finally {
        await sequelize.close();
    }
}

// Run the example
if (require.main === module) {
    runExample()
        .then(() => {
            console.log('\nExample completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('Example failed:', error);
            process.exit(1);
        });
}
