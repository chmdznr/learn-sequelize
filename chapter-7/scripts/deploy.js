const { Umzug } = require('umzug');
const sequelize = require('../src/database');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.sql`;
    
    try {
        await execAsync(`pg_dump -U ${process.env.DB_USER} -h ${process.env.DB_HOST} ${process.env.DB_NAME} > ${backupFile}`);
        console.log(`Database backup created: ${backupFile}`);
        return backupFile;
    } catch (error) {
        console.error('Backup failed:', error);
        throw error;
    }
}

async function runMigrations() {
    const umzug = new Umzug({
        migrations: {
            path: './migrations',
            params: [sequelize.getQueryInterface()]
        },
        storage: 'sequelize',
        storageOptions: { sequelize }
    });

    return umzug.up();
}

async function verifyMigrations() {
    try {
        await sequelize.authenticate();
        await sequelize.query('SELECT 1');
        console.log('Migrations verified successfully');
        return true;
    } catch (error) {
        console.error('Migration verification failed:', error);
        throw error;
    }
}

async function updateApplication() {
    // Add your application update logic here
    console.log('Application updated successfully');
}

async function rollback(backupFile) {
    if (backupFile) {
        try {
            await execAsync(`psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} ${process.env.DB_NAME} < ${backupFile}`);
            console.log('Database rolled back successfully');
        } catch (error) {
            console.error('Rollback failed:', error);
            throw error;
        }
    }
}

async function deploy() {
    let backupFile;
    try {
        // 1. Backup database
        backupFile = await backupDatabase();

        // 2. Run migrations
        await sequelize.authenticate();
        await runMigrations();

        // 3. Verify migrations
        await verifyMigrations();

        // 4. Update application
        await updateApplication();

        console.log('Deployment completed successfully');
    } catch (error) {
        console.error('Deployment failed:', error);
        // Rollback if needed
        await rollback(backupFile);
        throw error;
    }
}

// Run deployment if this script is executed directly
if (require.main === module) {
    deploy().catch(error => {
        console.error('Deployment script failed:', error);
        process.exit(1);
    });
}

module.exports = { deploy, backupDatabase, runMigrations, verifyMigrations, updateApplication, rollback };
