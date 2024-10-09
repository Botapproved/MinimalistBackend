'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Cart.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    products: {
      type: DataTypes.JSONB,  // Store an array of products as JSONB
      allowNull: false,
      defaultValue: []        // Initialize as an empty array
    }
  }, {
    sequelize,
    modelName: 'Cart',
  });

  return Cart;
};