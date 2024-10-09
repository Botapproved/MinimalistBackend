'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Order.init({
    userId: DataTypes.INTEGER,
    products: DataTypes.JSONB, // Similar to Cart
    totalAmount: DataTypes.FLOAT, // You may want to store the total price for the order
  }, {
    sequelize,
    modelName: 'Order',
  });

  return Order;
};
