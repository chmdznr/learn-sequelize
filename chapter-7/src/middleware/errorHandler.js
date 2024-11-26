const { Sequelize } = require('sequelize');

class DatabaseErrorHandler {
    static handle(error) {
        if (error instanceof Sequelize.ConnectionError) {
            return {
                status: 503,
                message: 'Database connection error',
                retryAfter: 30
            };
        }

        if (error instanceof Sequelize.ValidationError) {
            return {
                status: 400,
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            };
        }

        if (error instanceof Sequelize.UniqueConstraintError) {
            return {
                status: 409,
                message: 'Duplicate entry',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: 'Already exists'
                }))
            };
        }

        // Default error
        return {
            status: 500,
            message: 'Internal server error'
        };
    }
}

module.exports = DatabaseErrorHandler;
