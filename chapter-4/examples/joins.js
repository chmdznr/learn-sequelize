const { QueryTypes } = require('sequelize');
const { Order, User, sequelize } = require('../models');

// Example 1: Different types of joins
async function demonstrateJoins() {
  // Inner Join
  const innerJoinResults = await Order.findAll({
    include: [{
      model: User,
      required: true  // INNER JOIN
    }]
  });

  // Left Outer Join
  const leftJoinResults = await Order.findAll({
    include: [{
      model: User,
      required: false  // LEFT OUTER JOIN
    }]
  });

  // Right Join using literal SQL
  const rightJoinResults = await sequelize.query(`
    SELECT "Orders".*, "Users".*
    FROM "Orders"
    RIGHT JOIN "Users" ON "Orders"."userId" = "Users"."id"
  `, {
    type: QueryTypes.SELECT,
    model: Order,
    include: [User]
  });

  return {
    innerJoinResults,
    leftJoinResults,
    rightJoinResults
  };
}

module.exports = {
  demonstrateJoins
};
