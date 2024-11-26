class DatabaseConnectionManager {
    constructor(sequelize) {
        this.sequelize = sequelize;
        this.maxRetries = 5;
        this.retryDelay = 5000;
    }

    async connect() {
        let retries = 0;

        while (retries < this.maxRetries) {
            try {
                await this.sequelize.authenticate();
                console.log('Database connection established');
                return true;
            } catch (error) {
                retries++;
                console.error(
                    `Failed to connect to database (attempt ${retries}/${this.maxRetries}):`,
                    error.message
                );

                if (retries === this.maxRetries) {
                    throw new Error('Failed to connect to database');
                }

                await new Promise(resolve => 
                    setTimeout(resolve, this.retryDelay)
                );
            }
        }
    }

    async healthCheck() {
        try {
            await this.sequelize.query('SELECT 1');
            return true;
        } catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
}

module.exports = DatabaseConnectionManager;
