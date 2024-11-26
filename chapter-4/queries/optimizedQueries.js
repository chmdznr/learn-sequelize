const { Op } = require('sequelize');
const { Product, Order } = require('../models');
const sequelize = require('../config/database');

// Example of optimized queries using various techniques

// 1. Efficient Pagination with Keyset Pagination
async function paginateProducts(lastId, limit = 10) {
  return await Product.findAll({
    where: {
      id: { [Op.gt]: lastId }
    },
    order: [['id', 'ASC']],
    limit
  });
}

// 2. Optimized Eager Loading with Specific Attributes
async function getUserOrdersWithProducts(userId) {
  return await Order.findAll({
    where: { userId },
    attributes: ['id', 'totalAmount', 'orderDate'],
    include: [{
      model: Product,
      attributes: ['id', 'name', 'price'], // Select only needed fields
      through: { attributes: ['quantity'] }
    }],
    order: [['orderDate', 'DESC']]
  });
}

// 3. Complex Aggregation with Subqueries
async function getProductAnalytics() {
  return await Product.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'productCount'],
      [sequelize.fn('AVG', sequelize.col('price')), 'averagePrice'],
      [sequelize.literal('(SELECT COUNT(*) FROM orders WHERE "productId" = "Product"."id")'), 'totalOrders']
    ],
    group: ['category'],
    having: {
      'productCount': { [Op.gt]: 5 }
    }
  });
}

// 4. Optimized Search with Partial Index
async function searchProducts(query) {
  return await Product.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { category: { [Op.iLike]: `%${query}%` } }
      ]
    },
    order: [['lastUpdated', 'DESC']],
    limit: 20
  });
}

// 5. Batch Processing with Chunks
async function updateProductPrices(categoryId, increasePercentage) {
  const batchSize = 100;
  let offset = 0;
  
  while (true) {
    const products = await Product.findAll({
      where: { category: categoryId },
      limit: batchSize,
      offset: offset
    });
    
    if (products.length === 0) break;
    
    await Promise.all(products.map(product => 
      product.update({
        price: product.price * (1 + increasePercentage/100)
      })
    ));
    
    offset += batchSize;
  }
}

// 6. Using Window Functions to rank products by price within categories
async function getProductRankings() {
  return await Product.findAll({
    attributes: [
      'id',
      'name',
      'category',
      'price',
      [
        sequelize.literal(`
          RANK() OVER (
            PARTITION BY category 
            ORDER BY price DESC
          )
        `),
        'priceRank'
      ],
      [
        sequelize.literal(`
          AVG(price) OVER (
            PARTITION BY category
          )
        `),
        'categoryAvgPrice'
      ]
    ],
    order: [
      ['category', 'ASC'],
      ['price', 'DESC']
    ]
  });
}

// 7. Using HAVING for filtered aggregations
async function getHighValueCategories() {
  return await Product.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'productCount'],
      [sequelize.fn('SUM', sequelize.col('price')), 'totalValue']
    ],
    group: ['category'],
    having: sequelize.literal('SUM(price) > 1000 AND COUNT(*) >= 3')
  });
}

// 8. Using CTE (Common Table Expression) for hierarchical data
async function getOrderSummaryWithCTE() {
  return await sequelize.query(`
    WITH OrderSummary AS (
      SELECT 
        "userId",
        COUNT(*) as "orderCount",
        SUM("totalAmount") as "totalSpent",
        MAX("orderDate") as "lastOrderDate"
      FROM "Orders"
      GROUP BY "userId"
    )
    SELECT 
      u."username",
      os."orderCount",
      os."totalSpent",
      os."lastOrderDate"
    FROM "Users" u
    LEFT JOIN OrderSummary os ON u."id" = os."userId"
    ORDER BY os."totalSpent" DESC NULLS LAST
  `, { type: sequelize.QueryTypes.SELECT });
}

// 9. Using Window Partitioning for running totals and moving averages
async function getOrderAnalytics() {
  return await sequelize.query(`
    SELECT 
      "orderDate"::date as date,
      "totalAmount",
      SUM("totalAmount") OVER (
        ORDER BY "orderDate"::date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) as "runningTotal",
      AVG("totalAmount") OVER (
        ORDER BY "orderDate"::date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
      ) as "7dayMovingAverage"
    FROM "Orders"
    ORDER BY "orderDate"::date
  `, { type: sequelize.QueryTypes.SELECT });
}

module.exports = {
  paginateProducts,
  getUserOrdersWithProducts,
  getProductAnalytics,
  searchProducts,
  updateProductPrices,
  getProductRankings,
  getHighValueCategories,
  getOrderSummaryWithCTE,
  getOrderAnalytics
};
