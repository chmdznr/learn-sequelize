class DatabaseMonitor {
    constructor(sequelize) {
        this.sequelize = sequelize;
        this.metrics = {
            queries: {
                total: 0,
                failed: 0,
                slow: 0
            },
            connections: {
                active: 0,
                idle: 0,
                failed: 0
            }
        };
    }

    setupQueryLogging() {
        this.sequelize.options.benchmark = true;
        this.sequelize.options.logging = (sql, timing) => {
            this.metrics.queries.total++;

            if (timing > 1000) {
                this.metrics.queries.slow++;
                console.warn(`Slow query (${timing}ms):`, sql);
            }
        };
    }

    async getPoolStatus() {
        const pool = this.sequelize.connectionManager.pool;
        return {
            total: pool.size,
            idle: pool.idle,
            active: pool.size - pool.idle
        };
    }

    async getMetrics() {
        const poolStatus = await this.getPoolStatus();
        return {
            ...this.metrics,
            pool: poolStatus,
            timestamp: new Date()
        };
    }
}

module.exports = DatabaseMonitor;
