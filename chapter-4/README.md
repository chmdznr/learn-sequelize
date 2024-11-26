# Chapter 4: Advanced Query Optimization Techniques

This chapter demonstrates advanced query optimization techniques using Sequelize ORM with PostgreSQL. The project includes examples of complex queries, performance tuning, and scalability considerations.

## Project Structure

```
chapter-4/
├── config/
│   └── database.js     # Database configuration with read replicas
├── models/
│   ├── User.js         # User model
│   ├── Product.js      # Product model with optimized indexes
│   ├── Order.js        # Order model with comprehensive fields
│   └── Comment.js      # Polymorphic comment model
├── examples/
│   ├── subqueries.js   # Subquery examples
│   ├── joins.js        # Advanced join operations
│   └── performance.js  # Performance optimization examples
├── seeders/
│   └── index.js        # Database seeding script
├── app.js             # Main application with API endpoints
├── swagger.js         # Swagger documentation config
├── .env               # Environment variables
└── package.json       # Project dependencies
```

## Features

### Query Optimization Techniques
- **Complex Query Patterns**
  - Subqueries in WHERE clauses
  - Correlated subqueries
  - Efficient data filtering

- **Advanced Joins and Relationships**
  - Multiple join types (INNER, LEFT, RIGHT)
  - Polymorphic associations
  - Optimized eager loading

- **Performance Optimization**
  - Query analysis with EXPLAIN ANALYZE
  - Redis caching integration
  - Read replica configuration

### API Endpoints
- `/users/large-orders` - Demonstrates subqueries
- `/products/above-average` - Shows correlated subqueries
- `/comments/{type}/{id}` - Implements polymorphic associations
- `/users/cached` - Demonstrates Redis caching
- `/orders/analyze` - Complex query with performance monitoring and data masking

### Advanced Features

#### Query Optimization
- **Complex Queries**
  - Multi-level joins with eager loading
  - Conditional filtering with operators
  - Performance monitoring with console.time()

#### Security Features
- **Data Masking**
  - Automatic masking of sensitive fields (email, phone, credit card)
  - Configurable masking patterns
  - Middleware-based implementation

#### Caching and Performance
- Redis caching for frequently accessed data
- Query execution time monitoring
- Optimized eager loading with specific includes

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   DB_NAME=query_optimization_demo
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_READ_HOST_1=localhost
   DB_READ_HOST_2=localhost
   PORT=3000
   NODE_ENV=development
   ```

4. Run database migrations and seed data:
   ```bash
   node seeders/index.js
   ```

5. Start the application:
   ```bash
   npm start
   ```

6. Access Swagger documentation:
   ```
   http://localhost:3000/api-docs
   ```

## Query Optimization Best Practices

1. **Use Appropriate Indexes**
   - Create indexes for frequently queried fields
   - Use composite indexes for multi-column conditions
   - Consider partial indexes for filtered queries

2. **Optimize Join Operations**
   - Choose the right join type (INNER vs LEFT vs RIGHT)
   - Use indexes on joined fields
   - Limit the number of joins in a single query

3. **Implement Caching**
   - Use Redis for frequently accessed data
   - Set appropriate cache expiration times
   - Implement cache invalidation strategies

4. **Monitor Performance**
   - Use EXPLAIN ANALYZE for query analysis
   - Monitor slow queries
   - Track query patterns and optimize accordingly

5. **Scale with Read Replicas**
   - Configure read replicas for heavy read operations
   - Use appropriate load balancing
   - Monitor replication lag

## Testing Performance

1. Run the provided example queries:
   ```bash
   curl http://localhost:3000/users/large-orders?amount=1000
   curl http://localhost:3000/products/above-average
   curl http://localhost:3000/orders/analyze
   ```

2. Monitor query performance in logs
3. Check Redis cache hits/misses
4. Analyze query execution plans

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Advanced Query Optimization with Sequelize

This chapter demonstrates advanced query optimization techniques using Sequelize ORM with PostgreSQL. It includes examples of complex queries, caching strategies, and performance optimization techniques.

## Features

### Basic Query Optimization
- Efficient pagination using keyset pagination
- Optimized eager loading with specific attributes
- Complex aggregations with subqueries
- Optimized search with partial indexes
- Batch processing with chunks

### Advanced SQL Features
1. **Window Functions** (`/products/rankings`)
   - Rank products by price within categories
   - Calculate category-specific average prices
   - Demonstrate SQL PARTITION BY usage

2. **HAVING Clause** (`/categories/high-value`)
   - Filter aggregated results
   - Group products by category
   - Apply complex conditions on aggregated data

3. **Common Table Expressions (CTE)** (`/orders/summary`)
   - Generate hierarchical data queries
   - Improve query readability
   - Create temporary result sets

4. **Window Partitioning** (`/orders/analytics`)
   - Calculate running totals
   - Implement moving averages
   - Use window frame clauses

### Performance Features
- Redis caching for frequently accessed data
- Database indexing strategies
- Query optimization techniques
- Batch processing for large datasets

## API Endpoints

### Product Endpoints
- `GET /products/rankings` - Get product rankings within categories
- `GET /products/above-average` - Get products above average price
- `GET /products/search` - Search products with optimization

### Category Endpoints
- `GET /categories/high-value` - Get high-value product categories

### Order Endpoints
- `GET /orders/summary` - Get order summary using CTE
- `GET /orders/analytics` - Get order analytics with window functions
- `GET /orders/user/:userId` - Get user-specific orders

### User Endpoints
- `GET /users/cached` - Get active users (with Redis caching)
- `GET /users/large-orders` - Get users with large orders

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=query_optimization_demo
   DB_USER=your_username
   DB_PASSWORD=your_password
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   ```

3. Run the application:
   ```bash
   npm start
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Documentation
- Swagger UI available at `/api-docs`
- API documentation includes request/response schemas and examples

## Technologies Used
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- Redis
- Swagger UI

## Best Practices
- Proper error handling
- Request validation
- Response formatting
- Caching strategies
- Query optimization
- Database indexing
