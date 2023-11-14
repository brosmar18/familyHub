'use strict'

const express = require('express');
const logger = require('./utils/logger');

require('dotenv').config();

const app = express();

app.get('/', (req, res, next) => {
    res.status(200).send("Hello World!");
});

const start = (port = process.env.PORT || 5002) => {
    app.listen(port, () => {
        logger.info(`Server is running on PORT: ${port}`);
    });
};

module.exports = {
    app, 
    start,
};
