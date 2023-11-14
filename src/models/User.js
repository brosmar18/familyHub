'use strict';

const bcrypt = require('bcrypt');
const logger = require('../utils/logger'); 

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, 
            validate: {
                isEmail: true, // Validates that the string is an email
            },
        },
    }, {
        hooks: {
            // Before creating the User instance, hash the password
            beforeCreate: async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10); 
                logger.info('Hashed password in beforeCreate');
                user.password = hashedPassword; 
                logger.info('Creating User', { userId: user.id }); 
            }
        },
    });

    return User;
};
