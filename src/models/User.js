'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (Sequelize, DataTypes) => {
    const User = Sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        hooks: {
            beforeCreate: async (user) => {
                let hashedPassword = await bcrypt.hash(user.password, 5);
                console.log('Hashed password in beforeCreate: ', hashedPassword);
                user.password = hashedPassword;
                console.log('Creating User: ', JSON.stringify(user, null, 2));
            }
        },
    });
};

