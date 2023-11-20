'use strict';

const { start } = require('./src/server');
const { sequelizeDatabase } = require('./src/models');
const logger = require('./src/utils/logger');
require('dotenv').config();

// Handle graceful shutdown
function gracefulShutdown(error) {
    logger.error(error.message);
    sequelizeDatabase.close().then(() => {
        logger.info('Database Connection Closed.');
    }).finally(() => {
        process.exit(error ? 1: 0); 
    });
}

// Sync the database and start the server
sequelizeDatabase.sync()
    .then(() => {
        logger.info("Successful Connection to DB!");
        start();
    })
    .catch(gracefulShutdown); // Use the graceful shutdown function on errors.

// Handle uncaught exceptions and promise rejections
process.on('uncaughtException', gracefulShutdown);
process.on('unhandledRejection', gracefulShutdown);