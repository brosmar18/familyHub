'use strict';

const logger = require('../utils/logger');

module.exports = (req, res, next) => {
    const errorDetails = {
        error: 404,
        route: req.path,
        method: req.method,
        message: 'The requested resource was not found on this server.'
    };

    // Log the 404 error with the request details
    logger.warn(`404 - Not Found - ${req.method} ${req.path}`);

    // Send the error details to the client in a clear format
    res.status(404).json(errorDetails);
};
