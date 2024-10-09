"use strict";

const { ServiceSchema } = require("moleculer");
const { Sequelize } = require("sequelize");
const config = require("../config/config.json");
const UserModel = require("../models/user"); // User model
const ProductModel = require("../models/product"); // Product model
const CartModel = require("../models/cart"); // Product model
const OrderModel = require("../models/order"); // Product model

/** @type {ServiceSchema} */
module.exports = {
    name: "sequelize",

    created() {
        this.sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
            host: config.development.host,
            dialect: "postgres",
        });

        this.User = UserModel(this.sequelize, Sequelize.DataTypes);
        this.Product = ProductModel(this.sequelize,Sequelize.DataTypes); 
        this.Cart = CartModel(this.sequelize,Sequelize.DataTypes); // Initialize Product model
        this.Order = OrderModel(this.sequelize,Sequelize.DataTypes);
        console.log("User model:", this.User); // Check if model is initialized
        console.log("Product model:", this.Product); // Check if model is initialized
        console.log("Cart model:", this.Cart);
        console.log("Order model:", this.Order);

        this.sequelize.sync()
            .then(() => console.log("Database synchronized"))
            .catch(err => console.error("Error syncing database:", err));
    },

    actions: {
        async create(ctx) {
            const { model, data } = ctx.params;
            const Model = this[model];
            if (!Model) {
                console.error(`Available models: ${Object.keys(this)}`);
                throw new Error(`Model ${model} not found`);
            }
            return await Model.create(data);
        },
        async findOne(ctx) {
            const { model, where } = ctx.params;
            const Model = this[model];
            if (!Model) {
                console.error(`Available models: ${Object.keys(this)}`);
                throw new Error(`Model ${model} not found`);
            }

            // Check for query parameters in ctx.params
            if (where) {
                return await Model.findOne({ where });
            } else {
                throw new Error("ID parameter is required");
            }
        },
        async findAll(ctx) {
            const { model } = ctx.params;
            const Model = this[model];
            if (!Model) {
                console.error(`Available models: ${Object.keys(this)}`);
                throw new Error(`Model ${model} not found`);
            }
            return await Model.findAll();
        },
        async destroy(ctx) {
            const { model, where } = ctx.params;
            const Model = this[model];
            if (!Model) {
                console.error(`Available models: ${Object.keys(this)}`);
                throw new Error(`Model ${model} not found`);
            }
            return await Model.destroy({ where });
        },
        update: {
            async handler(ctx) {
                const { model, data, where } = ctx.params;
                const Model = this[model];
                return Model.update(data, { where });
            }
        }
    },
};
