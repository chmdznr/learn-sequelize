# Sequelize Production Example

This project demonstrates production-ready configurations and best practices for a Sequelize application with PostgreSQL.

## Features

- Production-grade database configuration
- Robust connection management with retry logic
- Query optimization and monitoring
- Database maintenance utilities
- Secure query building
- Deployment scripts with backup and rollback
- Error handling middleware

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Copy `.env.example` to `.env` and update the values:
```
DB_HOST=localhost
DB_NAME=production_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MAX=10
DB_POOL_MIN=2
NODE_ENV=production
```

## Directory Structure

```
├── config/
│   └── database.js         # Database configuration
├── src/
│   ├── database/
│   │   └── connectionManager.js
│   ├── services/
│   │   ├── queryOptimizer.js
│   │   └── secureQueryBuilder.js
│   ├── monitoring/
│   │   └── databaseMonitor.js
│   └── middleware/
│       └── errorHandler.js
└── scripts/
    ├── deploy.js          # Deployment script
    └── maintenance.js     # Database maintenance
```

## Usage

### Deployment

To deploy the application:

```bash
npm run deploy
```

This will:
1. Backup the database
2. Run migrations
3. Verify migrations
4. Update the application
5. Rollback if any step fails

### Maintenance

To run database maintenance:

```bash
npm run maintenance
```

This will:
1. Run VACUUM ANALYZE
2. Reindex tables
3. Clean up soft-deleted records

## Best Practices

1. Always use environment variables for sensitive data
2. Implement proper connection pooling
3. Monitor query performance
4. Handle database errors appropriately
5. Regularly maintain the database
6. Use secure query building to prevent SQL injection
7. Backup before deployments
8. Implement proper logging

## Security

- SSL is enabled for database connections
- Query parameters are sanitized
- Sensitive data is not logged
- Connection pooling is configured securely

## Monitoring

The DatabaseMonitor class provides:
- Query performance metrics
- Connection pool status
- Error tracking
- Slow query logging

## Error Handling

The DatabaseErrorHandler provides specific error responses for:
- Connection errors
- Validation errors
- Unique constraint violations
- Other database errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT

## Detailed Component Usage

### Prerequisites
1. Create the database:
```sql
CREATE DATABASE chapter7_db;
```

2. Configure your `.env` file:
```env
DB_HOST=localhost
DB_NAME=chapter7_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_PORT=5432
DB_DIALECT=postgres
NODE_ENV=production
```

### Component Examples

#### 1. DatabaseConnectionManager
Handles database connections with retry logic and health checks:

```javascript
const connectionManager = new DatabaseConnectionManager(sequelize);

// Connect with retry logic
await connectionManager.connect();
// Will retry 5 times with 5-second intervals if connection fails

// Check database health
const isHealthy = await connectionManager.healthCheck();
console.log('Is database healthy?', isHealthy);
```

#### 2. DatabaseMonitor
Monitors database performance and connection metrics:

```javascript
// Initialize
const monitor = new DatabaseMonitor(sequelize);

// Setup query logging
monitor.setupQueryLogging();

// Get metrics
const metrics = await monitor.getMetrics();
console.log('Database metrics:', {
    queries: {
        total: metrics.queries.total,
        failed: metrics.queries.failed,
        slow: metrics.queries.slow
    },
    connections: metrics.connections,
    pool: metrics.pool
});
```

#### 3. QueryOptimizer
Optimizes database queries with pagination and performance monitoring:

```javascript
// Paginated search with optimization
const results = await QueryOptimizer.findWithPagination(UserModel, {
    page: 1,
    pageSize: 10,
    where: {
        status: 'active'
    },
    order: [['createdAt', 'DESC']]
});

// Results structure:
{
    rows: [...], // Data
    pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 5,
        totalItems: 50
    }
}

// Monitor slow queries
const interceptor = QueryOptimizer.createQueryLoggingInterceptor();
// Automatically logs queries taking more than 1000ms
```

#### 4. DatabaseErrorHandler
Provides structured error handling for database operations:

```javascript
try {
    await User.create({
        email: 'duplicate@email.com' // Assuming this email exists
    });
} catch (error) {
    const errorResponse = DatabaseErrorHandler.handle(error);
}

// Error response examples:
// Connection error:
{
    status: 503,
    message: 'Database connection error',
    retryAfter: 30
}

// Validation error:
{
    status: 400,
    message: 'Validation error',
    errors: [
        { field: 'email', message: 'Email already exists' }
    ]
}
```

### Integration Example
Here's how to use all components together in an Express.js application:

```javascript
const express = require('express');
const app = express();

// Initialize components
const connectionManager = new DatabaseConnectionManager(sequelize);
const monitor = new DatabaseMonitor(sequelize);

// Database connection middleware
app.use(async (req, res, next) => {
    if (!await connectionManager.healthCheck()) {
        return res.status(503).json({ message: 'Database unavailable' });
    }
    next();
});

// Monitoring middleware
app.use(async (req, res, next) => {
    const metrics = await monitor.getMetrics();
    // Log or store metrics as needed
    next();
});

// Example route using all components
app.get('/users', async (req, res) => {
    try {
        const results = await QueryOptimizer.findWithPagination(User, {
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 10,
            where: req.query.filters
        });
        res.json(results);
    } catch (error) {
        const errorResponse = DatabaseErrorHandler.handle(error);
        res.status(errorResponse.status).json(errorResponse);
    }
});

// Start server with database connection
async function startServer() {
    try {
        await connectionManager.connect();
        monitor.setupQueryLogging();
        app.listen(3000, () => console.log('Server running'));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
```

### Running the Example
To run the complete example:

```bash
# Install dependencies
npm install

# Run the example
node examples/usage.js
```

The example demonstrates:
1. Database connection with retry mechanism
2. Query optimization with pagination
3. Error handling for database operations
4. Performance monitoring and metrics collection

Check `examples/usage.js` for the complete working example.
