"use strict";

const { ServiceSchema } = require("moleculer");
const { Sequelize } = require("sequelize");

/** @type {ServiceSchema} */
module.exports = {
    name: "products",

    actions: {
        add: {
            rest: "POST /add",
            params: {
                name: { type: "string", min: 1 },
                description: { type: "string", min: 1 },
                price: { type: "number", min: 0 },
                image: { type: "string" }, // Assuming it's a JSON object
                category: { type: "string", min: 1 },
                bestseller: { type: "boolean", optional: true } // Optional field
            },
            async handler(ctx) {
                const { name, description, price, image, category, bestseller } = ctx.params;
                const product = await this.createProduct(name, description, price, image, category, bestseller);
                return { message: "Product added successfully", product };
            },
        },

        remove: {
            rest: "DELETE /remove/:id",
            params: {
                id: { type: "any" },
            },
            async handler(ctx) {
                const { id } = ctx.params;
                const deletedCount = await this.removeProduct(id);
                if (deletedCount === 0) {
                    throw new this.Errors.NotFound("Product not found");
                }
                return { message: "Product removed successfully" };
            },
        },

        findAll: {
            rest: "GET /",
            async handler() {
                return await this.getAllProducts();
            },
        },

        findOne: {
            rest: "GET /:id",
            params: {
                id: { type: "any" },
            },
            async handler(ctx) {
                const { id } = ctx.params;
                const product = await this.getProductById(id);
                if (!product) {
                    throw new this.Errors.NotFound("Product not found");
                }
                return product;
            },
        },
    },

    methods: {
        async createProduct(name, description, price, image, category, bestseller) {
            return await this.broker.call("sequelize.create", {
                model: "Product",
                data: {
                    name,
                    description,
                    price,
                    image,
                    category,
                    date: new Date(), // Setting the current date
                    bestseller
                },
            });
        },

        async getAllProducts() {
            return await this.broker.call("sequelize.findAll", {
                model: "Product",
            });
        },

        async removeProduct(id) { // Renamed to match the action
            const result = await this.broker.call("sequelize.destroy", {
                model: "Product",
                where: { id }
            });

            // Check if any rows were deleted
            return result ? result : 0; // Return the count of deleted rows
        },

        async getProductById(id) {
            return await this.broker.call("sequelize.findOne", {
                model: "Product",
                where: { id }
            });
        },
    },
};
