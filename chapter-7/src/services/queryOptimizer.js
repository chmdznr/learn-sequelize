class QueryOptimizer {
    static async findWithPagination(model, options = {}) {
        const {
            page = 1,
            pageSize = 20,
            order = [['createdAt', 'DESC']],
            ...queryOptions
        } = options;

        const offset = (page - 1) * pageSize;

        const [count, rows] = await Promise.all([
            model.count({ where: queryOptions.where }),
            model.findAll({
                ...queryOptions,
                limit: pageSize,
                offset,
                order
            })
        ]);

        return {
            rows,
            pagination: {
                page,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
                totalItems: count
            }
        };
    }

    static createQueryLoggingInterceptor() {
        return {
            async before(options) {
                options._startTime = Date.now();
            },
            async after(options) {
                const duration = Date.now() - options._startTime;
                if (duration > 1000) {
                    console.warn(`Slow query (${duration}ms):`, options.sql);
                }
            }
        };
    }
}

module.exports = QueryOptimizer;
