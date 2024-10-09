'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Cart table
    await queryInterface.createTable('Carts', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',   // Name of the Users table
          key: 'id',        // The field that is referenced
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      products: {
        type: Sequelize.JSONB,  // JSONB to store an array of product IDs
        allowNull: false,
        defaultValue: [],       // Default to an empty array
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop Cart table
    await queryInterface.dropTable('Carts');
  }
};
