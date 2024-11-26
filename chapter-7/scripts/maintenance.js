const { Op } = require('sequelize');
const moment = require('moment');
const sequelize = require('../src/database');

class DatabaseMaintenance {
    static async vacuum() {
        await sequelize.query('VACUUM ANALYZE');
        console.log('Vacuum analyze completed');
    }

    static async reindex() {
        const tables = await sequelize.getQueryInterface().showAllTables();
        
        for (const table of tables) {
            await sequelize.query(`REINDEX TABLE "${table}"`);
            console.log(`Reindexed table: ${table}`);
        }
    }

    static async cleanupSoftDeleted() {
        const models = Object.values(sequelize.models)
            .filter(model => model.options.paranoid);

        for (const model of models) {
            const deleted = await model.destroy({
                where: {
                    deletedAt: {
                        [Op.lt]: moment().subtract(3, 'months')
                    }
                },
                force: true
            });
            console.log(`Cleaned up ${deleted} records from ${model.name}`);
        }
    }

    static async runMaintenance() {
        try {
            console.log('Starting database maintenance...');
            
            await this.vacuum();
            await this.reindex();
            await this.cleanupSoftDeleted();
            
            console.log('Database maintenance completed successfully');
        } catch (error) {
            console.error('Maintenance failed:', error);
            throw error;
        }
    }
}

// Run maintenance if this script is executed directly
if (require.main === module) {
    DatabaseMaintenance.runMaintenance().catch(error => {
        console.error('Maintenance script failed:', error);
        process.exit(1);
    });
}

module.exports = DatabaseMaintenance;
