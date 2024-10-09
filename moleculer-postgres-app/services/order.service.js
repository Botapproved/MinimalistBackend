"use strict";

const { ServiceSchema } = require("moleculer");

/** @type {ServiceSchema} */
module.exports = {
    name: "order",

    actions: {
        // Place an order for a specific userId
        placeOrder: {
            rest: "POST /:userId",
            params: {
                userId: { type: "any"},
            },
            async handler(ctx) {
                const { userId } = ctx.params;
            
                // Fetch the cart for the user (findOne instead of findAll)
                const cart = await this.getCartByUserId(userId);
                if (!cart) {
                    throw new this.Errors.NotFound("Cart is empty for this user");
                }
            
                // Calculate total amount (optional, can be calculated based on product prices)
                const totalAmount = cart.products.reduce((sum, item) => sum + item.price, 0);
            
                // Create an order from the cart contents
                const order = await this.createOrder(userId, cart.products, totalAmount);
            
                // Clear the user's cart (optional)
                await this.broker.call("cart.remove", { userId });
            
                return { message: "Order placed successfully", order };
            }
            
        },

        // Get all orders for a specific userId
        getOrders: {
            rest: "GET /:userId",
            params: {
                userId: { type: "any" },
            },
            async handler(ctx) {
                const { userId } = ctx.params;

                // Fetch all orders for the user
                const orders = await this.getAllOrders(userId);
                if (!orders || orders.length === 0) {
                    throw new this.Errors.NotFound("No orders found for this user");
                }

                return orders;
            },
        },
    },

    methods: {
        // Create an order from cart items
        async createOrder(userId, products, totalAmount) {
            return await this.broker.call("sequelize.create", {
                model: "Order",
                data: {
                    userId,
                    products,
                    totalAmount,
                },
            });
        },

        // Get all orders for a specific user
        async getAllOrders(userId) {
            return await this.broker.call("sequelize.findAll", {
                model: "Order",
                where: { userId },
            });
        },
        async getCartByUserId(userId) {
            return await this.broker.call("sequelize.findOne", {
                model: "Cart",
                where: { userId },
            });
        },
    },
};
