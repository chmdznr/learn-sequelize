# Chapter 3: Query Optimization with Sequelize

This chapter focuses on implementing and demonstrating various query optimization techniques using Sequelize ORM with PostgreSQL. The project includes optimized models, relationships, and endpoints that showcase best practices for database querying.

## Project Structure

```
chapter-3/
├── config/
│   └── database.js     # Database configuration
├── models/
│   ├── index.js        # Model associations
│   ├── Product.js      # Product model with optimized indexes
│   ├── Order.js        # Order model with comprehensive fields
│   └── OrderItem.js    # OrderItem model with unique constraints
├── seeders/
│   └── index.js        # Database seeding script with faker data
├── app.js             # Main application file with endpoints
├── .env               # Environment variables
└── package.json       # Project dependencies
```

## Features

- **Optimized Models**
  - Consistent naming conventions (camelCase in JavaScript, snake_case in database)
  - Products with UUID primary keys and optimized indexes
  - Orders with comprehensive tracking (status, payment, delivery)
  - OrderItems with unique product per order constraint
  - JSONB fields for flexible data storage (specifications)

- **Model Optimizations**
  - Efficient indexes on commonly queried fields
  - Unique constraints to maintain data integrity
  - Proper foreign key relationships with cascade options
  - Automated field name conversion with `underscored: true`

- **Query Optimization Examples**
  - Efficient data fetching with `findByPk` and `findOne`
  - Complex queries using Sequelize operators
  - Optimized eager loading with `include`
  - Aggregation queries for analytics
  - JSONB field querying with GIN indexes

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository and navigate to the chapter-3 directory

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with your PostgreSQL credentials:
```env
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
DB_HOST=localhost
DB_PORT=5432
```

4. Run database seeds to populate test data
```bash
npm run seed
```

5. Start the application
```bash
npm start
```

## Model Details

### Product Model
- Fields:
  - `id`: UUID primary key
  - `name`: String (unique, indexed)
  - `description`: Text
  - `price`: Decimal(10,2) (indexed)
  - `stock`: Integer
  - `category`: String (indexed)
  - `brand`: String (indexed)
  - `specifications`: JSONB (GIN indexed)
  - `tags`: Array of strings
  - `status`: Enum ('active', 'inactive', 'discontinued')

### Order Model
- Fields:
  - `id`: UUID primary key
  - `orderNumber`: String (unique)
  - `status`: Enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
  - `totalAmount`: Decimal(10,2)
  - `shippingAddress`: JSON
  - `customerDetails`: JSON
  - `orderDate`: Date
  - `deliveryDate`: Date (nullable)
  - `paymentStatus`: Enum ('pending', 'paid', 'failed', 'refunded')
  - `paymentMethod`: Enum ('creditCard', 'debitCard', 'paypal', 'bankTransfer')

### OrderItem Model
- Fields:
  - `id`: UUID primary key
  - `orderId`: UUID (foreign key)
  - `productId`: UUID (foreign key)
  - `quantity`: Integer
  - `unitPrice`: Decimal(10,2)
  - `totalPrice`: Decimal(10,2)
  - `discount`: Decimal(10,2)
- Constraints:
  - Unique constraint on (orderId, productId)

## API Endpoints

### Products
- `GET /products`: Get products with filtering and pagination
  - Query parameters:
    - `minPrice`: Filter by minimum price
    - `maxPrice`: Filter by maximum price
    - `category`: Filter by category
    - `brand`: Filter by brand
    - `status`: Filter by status
    - `search`: Search in name and description
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
    - `specifications`: JSON object for JSONB field filtering

### Orders
- `GET /orders/search`: Search orders by city in shipping address
  - Query parameters:
    - `city`: Filter by city name
- `GET /orders/:id`: Get order by ID with nested items and product details
- `GET /orders/stats`: Get order statistics with filtering
  - Query parameters:
    - `startDate`: Filter by start date
    - `endDate`: Filter by end date
    - `status`: Filter by order status
    - `paymentStatus`: Filter by payment status
- `POST /orders`: Create a new order
  - Request body includes customer details, shipping address, and items array

## Seeder Details

The seeder generates:
- 50 products with realistic commerce data
- 20 orders with random items (1-5 items per order)
- Unique product-order combinations
- Realistic prices, quantities, and discounts
- Random but valid dates for orders and deliveries

## Error Handling

- Proper validation for all required fields
- Transaction support for order creation
- Unique constraint handling
- Foreign key relationship enforcement
