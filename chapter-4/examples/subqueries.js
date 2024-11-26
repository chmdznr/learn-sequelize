const { Op } = require('sequelize');
const { User, Order, sequelize } = require('../models');

// Example 1: Subqueries in WHERE clause
async function getUsersWithLargeOrders() {
  // Using literal subquery
  const usersWithSubquery = await User.findAll({
    where: {
      id: {
        [Op.in]: sequelize.literal(`(
          SELECT DISTINCT "userId"
          FROM "Orders"
          WHERE "totalAmount" > 1000
        )`)
      }
    }
  });

  // Alternative using include
  const usersWithInclude = await User.findAll({
    include: [{
      model: Order,
      where: {
        totalAmount: {
          [Op.gt]: 1000
        }
      },
      required: true,
      attributes: []
    }]
  });

  return { usersWithSubquery, usersWithInclude };
}

// Example 2: Correlated Subqueries
async function getProductsAboveAverage() {
  return await Product.findAll({
    where: {
      price: {
        [Op.gt]: sequelize.literal(`(
          SELECT AVG(price)
          FROM "Products" AS p2
          WHERE p2."categoryId" = "Product"."categoryId"
        )`)
      }
    },
    include: [{
      model: Category,
      attributes: ['name']
    }]
  });
}

module.exports = {
  getUsersWithLargeOrders,
  getProductsAboveAverage
};
