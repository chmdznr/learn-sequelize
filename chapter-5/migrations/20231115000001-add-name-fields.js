'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add firstName column
    await queryInterface.addColumn('Users', 'firstName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Add lastName column
    await queryInterface.addColumn('Users', 'lastName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Create index on name fields
    await queryInterface.addIndex('Users', {
      fields: ['firstName', 'lastName'],
      name: 'users_name_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    await queryInterface.removeIndex('Users', 'users_name_idx');
    
    // Remove columns
    await queryInterface.removeColumn('Users', 'firstName');
    await queryInterface.removeColumn('Users', 'lastName');
  }
};
