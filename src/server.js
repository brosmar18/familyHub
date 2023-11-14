'use strict'

const express = require('express');
const logger = require('./utils/logger');


require('dotenv').config();
const PORT = process.env.PORT || 5002;

const app = express();

app.get('/', (req, res, next) => {
    res.status(200).send("Hello World!");
});

const start = () => {
    app.listen(PORT, () => {
        logger.info(`Server is running on PORT: ${PORT}`);
    });
};

module.exports = {
    app, 
    start,
};