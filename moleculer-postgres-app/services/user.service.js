"use strict";

const bcrypt = require("bcrypt");
const { ServiceSchema } = require("moleculer");

/** @type {ServiceSchema} */
module.exports = {
    name: "user",

    actions: {
        register: {
            rest: "POST /register",
            params: {
                userName: { type: "string", min: 3 },
                password: { type: "string", min: 6 },
            },
            async handler(ctx) {
                const { userName, password } = ctx.params;
                const hashedPassword = await bcrypt.hash(password, 10);
                console.log(hashedPassword);
                const user = await this.createUser(userName, hashedPassword);
                return { message: "User registered successfully", user };
            },
        },

        login: {
            rest: "POST /login",
            params: {
                userName: { type: "string" },
                password: { type: "string" },
            },
            async handler(ctx) {
                const { userName, password } = ctx.params;
                console.log('Received login request:', { userName, password });
                const user = await this.getUserByUserName(userName);
                if (!user) {
                    throw new this.Errors.NotFound("User not found");
                }

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    throw new this.Errors.UnAuthorized("Invalid password");
                }

                return { message: "Login successful", user };
            },
        },

        logout: {
            rest: "POST /logout",
            async handler() {
                return { message: "User logged out" };
            },
        },
    },

    methods: {
        async createUser(userName, hashedPassword) {
            return await this.broker.call("sequelize.create", {
                model: "User",
                data: {
                    userName,
                    password: hashedPassword,
                },
            });
        },

        async getUserByUserName(userName) {
            return await this.broker.call("sequelize.findOne", {
                model: "User",
                where: { userName },
            });
        },
    },
};
