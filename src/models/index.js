'use strict';

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const user = require('./User');
const event = require('./Event');
const Collection = require('./Collection');

const DATABASE_URL = process.env.NODE_ENV === 'test' ? 'sqlite::memory' : process.env.DATABASE_URL;
const sequelizeDatabase = new Sequelize(DATABASE_URL);

// Import model definitions
const userModel = user(sequelizeDatabase, DataTypes);
const eventModel = event(sequelizeDatabase, DataTypes);

// Associations
eventModel.associate({ User: userModel });

module.exports = {
    sequelizeDatabase,
    userCollection: new Collection(userModel),
    eventCollection: new Collection(eventModel),
};
