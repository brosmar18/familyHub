'use strict';

const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
    // Log the error with all available information
    logger.error(`500 - Server Error - ${req.method} ${req.path} - Error message: ${err.message}`, {
        error: err,
        route: req.path,
        query: req.query,
        body: req.body 
    });

    // Respond with a generic error message to avoid revealing sensitive error details to the client
    res.status(500).json({
        error: 500,
        route: req.path,
        message: 'An unexpected error occurred on the server.'
    });
};
