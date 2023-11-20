'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

require('dotenv').config();
const SECRET = process.env.SECRET || 'secretString';


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
                isEmail: true,
            },
        },
        role: {
            type: DataTypes.ENUM('user', 'writer', 'editor', 'admin'),
            required: true,
            defaultValue: 'user',
        },
        token: {
            type: DataTypes.VIRTUAL,
            get() {
                return jwt.sign({ username: this.username }, SECRET, { expiresIn: '15h' });
            },
            set(tokenValue) {
                // Set token should not re-generate the token
                throw new Error('Cannot set token directly');
            },
        },
        capabilities: {
            type: DataTypes.VIRTUAL,
            get() {
                const acl = {
                    user: ['read'],
                    writer: ['read', 'create'],
                    editor: ['read', 'create', 'update'],
                    admin: ['read', 'create', 'update', 'delete']
                };
                return acl[this.role];
            }
        },
    }, {
        hooks: {
            beforeCreate: async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                logger.info('Hashed password in beforeCreate');
                user.password = hashedPassword;
            }
        },
    });

    User.authenticateBearer = async (token) => {
        try {
            const parsedToken = jwt.verify(token, SECRET);
            const user = await User.findOne({ where: { username: parsedToken.username } });
            if (user) {
                return user;
            } else {
                logger.error('User not found during token authentication');
                throw new Error("User Not Found");
            }
        } catch (e) {
            logger.error(`Error in authenticateBearer: ${e.message}`);
            throw new Error(e.message);
        }
    };

    return User;
};
