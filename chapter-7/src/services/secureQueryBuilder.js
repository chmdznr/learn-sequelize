const { Op } = require('sequelize');

class SecureQueryBuilder {
    static buildWhereClause(filters) {
        const where = {};
        const allowedOperators = ['eq', 'gt', 'lt', 'like'];

        for (const [key, value] of Object.entries(filters)) {
            if (typeof value === 'object') {
                const operator = Object.keys(value)[0];
                if (!allowedOperators.includes(operator)) {
                    throw new Error(`Invalid operator: ${operator}`);
                }
                where[key] = { [Op[operator]]: value[operator] };
            } else {
                where[key] = value;
            }
        }

        return where;
    }

    static sanitizeOrder(orderBy) {
        const allowedFields = ['id', 'createdAt', 'updatedAt'];
        const [field, direction] = orderBy.split(' ');

        if (!allowedFields.includes(field)) {
            throw new Error(`Invalid order field: ${field}`);
        }

        return [[field, direction.toUpperCase()]];
    }

    static createSecureQuery(options) {
        const { filters, orderBy, ...otherOptions } = options;
        
        const query = {
            ...otherOptions
        };

        if (filters) {
            query.where = this.buildWhereClause(filters);
        }

        if (orderBy) {
            query.order = this.sanitizeOrder(orderBy);
        }

        return query;
    }
}

module.exports = SecureQueryBuilder;
