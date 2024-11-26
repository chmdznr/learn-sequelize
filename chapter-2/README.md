# Chapter 2 - Basic Sequelize Setup

This project demonstrates the basic setup of a Node.js application with Express.js and Sequelize ORM.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a PostgreSQL database named `sequelize_demo`
4. Configure your database connection in `.env` file:
   ```
   DB_NAME=sequelize_demo
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   PORT=3000
   ```

## Database Seeding

The project includes a seeder that populates the database with dummy data:

- 3 roles (admin, moderator, user)
- 10 users with profiles
- 5 posts per user
- Role assignments (first user as admin, second as moderator, rest as regular users)

To seed the database:
```bash
npm run seed
```

All seeded users have the password: `Test123!@#`

## Running the Application

Start the server:
```bash
npm start
```

## API Endpoints

### Users
- `POST /users` - Create a new user with profile
- `GET /users/:id` - Get user with profile and posts
- `POST /users/:id/posts` - Create a post for a user
- `POST /users/:id/roles` - Assign role to user
- `GET /db-test` - Test database connection

## Example API Calls

1. Create a user:
```bash
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!@#",
  "age": 25,
  "birthDate": "1998-01-01",
  "bio": "Test bio",
  "website": "https://example.com"
}'
```

2. Get user with profile and posts:
```bash
curl http://localhost:3000/users/:id
```

3. Create a post:
```bash
curl -X POST http://localhost:3000/users/:id/posts -H "Content-Type: application/json" -d '{
  "title": "Test Post",
  "content": "This is a test post"
}'
```

## Project Structure

```
chapter-2/
├── config/
│   └── database.js     # Database configuration
├── models/
│   ├── index.js        # Sequelize instance and relationships
│   ├── User.js         # User model
│   ├── Profile.js      # Profile model
│   ├── Post.js         # Post model
│   ├── Role.js         # Role model
│   └── UserRole.js     # UserRole junction model
├── seeders/
│   └── index.js        # Database seeder
├── .env                # Environment variables
├── app.js             # Main application file
├── package.json       # Project dependencies
└── README.md         # Project documentation
