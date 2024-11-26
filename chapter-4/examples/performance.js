const Redis = require('ioredis');
const { User, Profile, sequelize } = require('../models');

const redis = new Redis();

// Example 1: Query Analysis
async function analyzeQuery() {
  const [analysis] = await sequelize.query(`
    EXPLAIN ANALYZE
    SELECT "Users".*, COUNT("Orders"."id") as "orderCount"
    FROM "Users"
    LEFT JOIN "Orders" ON "Users"."id" = "Orders"."userId"
    GROUP BY "Users"."id"
  `);
  
  console.log(analysis);
}

// Example 2: Query Result Caching
async function getCachedUsers() {
  const cacheKey = 'users:active';
  
  // Try to get from cache
  let users = await redis.get(cacheKey);
  
  if (users) {
    return JSON.parse(users);
  }
  
  // If not in cache, query database
  users = await User.findAll({
    where: { status: 'active' },
    include: [{
      model: Profile,
      attributes: ['avatar']
    }]
  });
  
  // Cache the result
  await redis.setex(cacheKey, 3600, JSON.stringify(users));
  
  return users;
}

// Example 3: Query Monitoring
const queryMonitoring = {
  benchmark: true,
  logging: (sql, timing) => {
    // Log slow queries
    if (timing > 1000) {
      console.warn(`Slow query (${timing}ms):`, sql);
      
      // Send to monitoring service
      monitor.trackQuery({
        sql,
        timing,
        timestamp: new Date()
      });
    }
    
    // Track query patterns
    const queryType = sql.split(' ')[0].toLowerCase();
    console.log(`Query type: ${queryType}, Time: ${timing}ms`);
  }
};

module.exports = {
  analyzeQuery,
  getCachedUsers,
  queryMonitoring
};
