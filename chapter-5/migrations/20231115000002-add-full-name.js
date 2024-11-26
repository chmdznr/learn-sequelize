'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add fullName column
    await queryInterface.addColumn('Users', 'fullName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Update data in batches
    const batchSize = 1000;
    let offset = 0;
    
    while (true) {
      const users = await queryInterface.sequelize.query(
        `SELECT id, "firstName", "lastName" 
         FROM "Users" 
         WHERE "firstName" IS NOT NULL 
         AND "lastName" IS NOT NULL
         LIMIT ${batchSize} OFFSET ${offset}`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (users.length === 0) break;

      for (const user of users) {
        await queryInterface.sequelize.query(
          `UPDATE "Users" 
           SET "fullName" = :fullName 
           WHERE id = :id`,
          {
            replacements: {
              id: user.id,
              fullName: `${user.firstName} ${user.lastName}`.trim()
            }
          }
        );
      }

      offset += batchSize;
    }

    // Remove old columns
    await queryInterface.removeColumn('Users', 'firstName');
    await queryInterface.removeColumn('Users', 'lastName');
  },

  async down(queryInterface, Sequelize) {
    // Add back the original columns
    await queryInterface.addColumn('Users', 'firstName', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'lastName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Split fullName back into firstName and lastName
    const batchSize = 1000;
    let offset = 0;

    while (true) {
      const users = await queryInterface.sequelize.query(
        `SELECT id, "fullName" 
         FROM "Users" 
         WHERE "fullName" IS NOT NULL
         LIMIT ${batchSize} OFFSET ${offset}`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (users.length === 0) break;

      for (const user of users) {
        const [firstName, ...lastNameParts] = user.fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        await queryInterface.sequelize.query(
          `UPDATE "Users" 
           SET "firstName" = :firstName, 
               "lastName" = :lastName 
           WHERE id = :id`,
          {
            replacements: {
              id: user.id,
              firstName: firstName || null,
              lastName: lastName || null
            }
          }
        );
      }

      offset += batchSize;
    }

    // Remove fullName column
    await queryInterface.removeColumn('Users', 'fullName');
  }
};
