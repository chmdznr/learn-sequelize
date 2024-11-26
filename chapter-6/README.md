# Chapter 6: Advanced Model Patterns and Data Validation

This chapter demonstrates advanced Sequelize patterns including model inheritance, mixins, and sophisticated validation techniques.

## Project Structure

```
chapter-6/
├── config/
│   └── database.js         # Database configuration
├── models/
│   ├── mixins/
│   │   ├── SoftDeleteMixin.js
│   │   └── TimestampMixin.js
│   ├── Content.js          # Base content model
│   ├── Article.js          # Article model (extends Content)
│   ├── Video.js            # Video model (extends Content)
│   ├── Order.js            # Order model with advanced validation
│   └── Product.js          # Product model with context-aware validation
├── routes/
│   └── content.routes.js   # Content API routes
├── tests/
│   └── api.test.js         # API test suite
├── .env                    # Environment variables (not in version control)
├── .env.example           # Environment variables template
└── package.json
```

## Features

1. **Model Inheritance**
   - Single Table Inheritance (STI) implementation
   - Base Content model with Article and Video extensions
   - Type discrimination using 'type' column

2. **Model Mixins**
   - SoftDelete functionality
   - Timestamp management
   - Reusable model behaviors

3. **Advanced Validation**
   - Custom validators
   - Context-aware validation
   - Complex business rules
   - Status transition validation

4. **Model Hooks**
   - Sophisticated hook patterns
   - Transaction management
   - Side effect handling
   - Data consistency enforcement

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chapter6_db
DB_USER=your_username
DB_PASSWORD=your_password
DB_DIALECT=postgres
```

3. Create the database:
```sql
CREATE DATABASE chapter6_db;
```

## Running the Examples

The models are ready to use in your application. Here are some example usages:

```javascript
// Create different content types
const article = await Article.create({
  title: 'Understanding STI',
  content: 'Single Table Inheritance...'
});

const video = await Video.create({
  title: 'STI Tutorial',
  content: 'Video description',
  metadata: { duration: 360 }
});

// Using soft delete
const user = await User.findByPk(1);
await user.softDelete();
const allUsers = await User.withDeleted();

// Complex validation
const order = await Order.create({
  items: [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 }
  ],
  status: 'pending'
});

## API Endpoints

### Content Management

1. **Create Content**
   - `POST /api/content`
   - Creates either an Article or Video based on the type field
   - Body example:
     ```json
     {
       "type": "article",
       "title": "Sample Article",
       "content": "Article content...",
       "status": "draft"
     }
     ```

2. **Get Content**
   - `GET /api/content/:id`
   - Retrieves content by ID
   - Returns polymorphic content (Article or Video)

3. **Update Content**
   - `PUT /api/content/:id`
   - Updates content with validation
   - Supports status transitions

4. **Delete Content**
   - `DELETE /api/content/:id`
   - Implements soft delete via mixin

5. **List Content**
   - `GET /api/content`
   - Supports filtering and pagination
   - Query params:
     - `type`: Filter by content type
     - `status`: Filter by status
     - `page`: Page number
     - `limit`: Items per page

## Testing

The project includes a comprehensive test suite using Jest:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test tests/api.test.js
```

Test categories:
- API endpoint validation
- Model validation and constraints
- Status transition rules
- Soft delete functionality
- Error handling
