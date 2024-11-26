const { sequelize, User, Profile, Post, Role, UserRole } = require('../models');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

// Create roles
async function seedRoles() {
  const roles = [
    {
      name: 'admin',
      description: 'Administrator role with full access',
      permissions: {
        read: true,
        write: true,
        delete: true,
        admin: true
      }
    },
    {
      name: 'moderator',
      description: 'Moderator role with limited access',
      permissions: {
        read: true,
        write: true,
        delete: true,
        admin: false
      }
    },
    {
      name: 'user',
      description: 'Regular user role',
      permissions: {
        read: true,
        write: true,
        delete: false,
        admin: false
      }
    }
  ];

  return await Role.bulkCreate(roles);
}

// Create users with profiles
async function seedUsers(count = 10) {
  const users = [];
  const salt = await bcrypt.genSalt(10);

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = {
      username: faker.internet.userName({ firstName, lastName }),
      email: faker.internet.email({ firstName, lastName }),
      password: await bcrypt.hash('Test123!@#', salt), // All users get the same password for testing
      age: faker.number.int({ min: 18, max: 80 }),
      birthDate: faker.date.past({ years: 50 }),
      isActive: true,
      settings: {
        theme: faker.helpers.arrayElement(['light', 'dark']),
        notifications: faker.datatype.boolean(),
        language: faker.helpers.arrayElement(['en', 'es', 'fr'])
      },
      Profile: {
        bio: faker.person.bio(),
        website: faker.internet.url(),
        social: {
          twitter: faker.internet.userName(),
          facebook: faker.internet.userName(),
          instagram: faker.internet.userName()
        },
        avatar: faker.image.avatar()
      }
    };
    users.push(user);
  }

  return await User.bulkCreate(users, {
    include: [Profile]
  });
}

// Create posts for users
async function seedPosts(users, postsPerUser = 5) {
  const posts = [];

  for (const user of users) {
    for (let i = 0; i < postsPerUser; i++) {
      const post = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        status: faker.helpers.arrayElement(['draft', 'published', 'archived']),
        tags: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.lorem.word()),
        userId: user.id
      };
      posts.push(post);
    }
  }

  return await Post.bulkCreate(posts);
}

// Assign roles to users
async function assignRoles(users, roles) {
  const assignments = [];

  // Assign admin role to first user
  assignments.push({
    userId: users[0].id,
    roleId: roles[0].id, // admin role
    assignedAt: new Date(),
    assignedBy: users[0].id
  });

  // Assign moderator role to second user
  assignments.push({
    userId: users[1].id,
    roleId: roles[1].id, // moderator role
    assignedAt: new Date(),
    assignedBy: users[0].id
  });

  // Assign user role to remaining users
  for (let i = 2; i < users.length; i++) {
    assignments.push({
      userId: users[i].id,
      roleId: roles[2].id, // user role
      assignedAt: new Date(),
      assignedBy: users[0].id
    });
  }

  return await UserRole.bulkCreate(assignments);
}

async function seedDatabase() {
  try {
    // Drop all tables and their associated indexes
    await sequelize.getQueryInterface().dropAllTables();
    console.log('All tables dropped');

    // Recreate tables with new schema
    await sequelize.sync({ force: true });
    console.log('Database tables recreated');

    // Seed roles
    const roles = await seedRoles();
    console.log('Roles seeded');

    // Seed users with profiles
    const users = await seedUsers(10);
    console.log('Users and profiles seeded');

    // Seed posts
    await seedPosts(users, 5);
    console.log('Posts seeded');

    // Assign roles
    await assignRoles(users, roles);
    console.log('Roles assigned');

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeder
seedDatabase();
