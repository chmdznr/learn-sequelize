# Chapter 5: Database Migrations and Schema Management

This project demonstrates how to effectively manage database schema changes using Sequelize migrations. It covers various migration patterns, best practices, and techniques for maintaining data integrity during schema updates.

## Project Structure

```
chapter-5/
├── config/
│   └── database.js     # Database configuration for different environments
├── migrations/
│   ├── 20231115000000-create-users-table.js    # Initial Users table creation
│   ├── 20231115000001-add-name-fields.js       # Adding name columns
│   └── 20231115000002-add-full-name.js         # Data migration example
├── .sequelizerc        # Sequelize CLI configuration
├── package.json        # Project dependencies
└── README.md          # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create the database:
```bash
createdb chapter5_dev
```

3. Run migrations:
```bash
npx sequelize-cli db:migrate
```

## Migration Examples

### 1. Creating Tables (20231115000000-create-users-table.js)
- Demonstrates table creation with UUID primary key
- Shows how to set up indexes
- Includes ENUM type usage
- Implements proper timestamps

### 2. Adding Columns (20231115000001-add-name-fields.js)
- Shows how to add new columns to existing tables
- Demonstrates index creation on multiple columns
- Includes proper rollback functionality

### 3. Data Migration (20231115000002-add-full-name.js)
- Demonstrates batch processing for large datasets
- Shows how to handle data transformations
- Implements proper error handling
- Provides complete rollback capability

## Common Commands

### Migration Management
```bash
# Run pending migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status
```

### Creating New Migrations
```bash
# Generate a new migration file
npx sequelize-cli migration:generate --name migration-name
```

## Best Practices Demonstrated

1. **Zero-Downtime Migrations**
   - Adding nullable columns first
   - Updating data in batches
   - Removing old columns after data migration

2. **Data Integrity**
   - Proper index management
   - Transaction usage where appropriate
   - Complete rollback support

3. **Performance Considerations**
   - Batch processing for large datasets
   - Efficient indexing strategies
   - Optimized query patterns

4. **Code Organization**
   - Clear separation of concerns
   - Well-documented migrations
   - Consistent naming conventions

## Environment Configuration

The project supports multiple environments (development, test, production) through `config/database.js`:

- **Development**: Local development settings
- **Test**: Testing environment configuration
- **Production**: Production settings using environment variables

## Troubleshooting

If you encounter any issues:

1. Ensure PostgreSQL is running
2. Check database credentials in `config/database.js`
3. Make sure all dependencies are installed
4. Verify that the database exists
5. Check migration status using `db:migrate:status`

## Additional Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Sequelize CLI Documentation](https://github.com/sequelize/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
