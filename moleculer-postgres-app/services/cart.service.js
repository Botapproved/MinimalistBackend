"use strict";

const { ServiceSchema } = require("moleculer");

/** @type {ServiceSchema} */
module.exports = {
    name: "cart",

    actions: {
        add: {
            rest: "POST /add",
            params: {
                userId: { type: "number", min: 1 },
                productId: { type: "number", min: 1 },
            },
            async handler(ctx) {
                const { userId, productId } = ctx.params;
                const cartItem = await this.addProductToCart(userId, productId);
                return { message: "Product added to cart successfully", cartItem };
            },
        },

        remove: {
            rest: "DELETE /remove/:userId",
            params: {
                userId: { type: "any" },
                productId: { type: "any", optional: true },
            },
            async handler(ctx) {
                const { userId, productId } = ctx.params;
                if (productId) {
                    const updatedCart = await this.removeProductFromCart(userId, productId);
                    return { message: `Product ${productId} removed from cart`, updatedCart };
                } else {
                    const deletedCount = await this.removeCart(userId);
                    return { message: `Cart of User ${userId} removed successfully`, deletedCount };
                }
            },
        },

        findAll: {
            rest: "GET /:userId",
            params: {
                userId: { type: "any" },
            },
            async handler(ctx) {
                const { userId } = ctx.params;
                return await this.getCart(userId);
            },
        },
    },

    methods: {
        // Add a product to the user's cart
        async addProductToCart(userId, productId) {
            // Find the user's cart
            const cart = await this.broker.call("sequelize.findOne", {
                model: "Cart",
                where: { userId },
            });

            if (cart) {
                // If the cart exists, add the productId to the products array
                cart.products.push({ productId });
                await this.broker.call("sequelize.update", {
                    model: "Cart",
                    data: { products: cart.products },
                    where: { userId }
                });
                return cart;
            } else {
                // If no cart exists, create a new cart with the product
                const newCart = await this.broker.call("sequelize.create", {
                    model: "Cart",
                    data: {
                        userId,
                        products: [{ productId }],
                    },
                });
                return newCart;
            }
        },

        // Remove a product from the user's cart
        async removeProductFromCart(userId, productId) {
            const cart = await this.broker.call("sequelize.findOne", {
                model: "Cart",
                where: { userId },
            });

            if (cart) {
                // Filter out the product from the products array
                cart.products = cart.products.filter(item => item.productId !== productId);

                // Update the cart
                await this.broker.call("sequelize.update", {
                    model: "Cart",
                    data: { products: cart.products },
                    where: { userId }
                });

                return cart;
            } else {
                throw new this.Errors.NotFound("Cart not found");
            }
        },

        // Get all products in the user's cart
        async getCart(userId) {
            return await this.broker.call("sequelize.findOne", {
                model: "Cart",
                where: { userId },
            });
        },

        // Remove the entire cart for a user
        async removeCart(userId) {
            const result = await this.broker.call("sequelize.destroy", {
                model: "Cart",
                where: { userId },
            });

            return result ? result : 0;
        },
    },
};
