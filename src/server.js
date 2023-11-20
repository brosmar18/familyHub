'use strict'

const express = require('express');
const logger = require('./utils/logger');

// Error Handlers 
const notFound = require('./handlers/404');
const errorHandler = require('./handlers/500');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

require('dotenv').config();

const app = express();
app.use(express.json());


app.get('/', (req, res, next) => {
    res.status(200).send("Hello World!");
});

app.get('/error', (req, res, next) => {
    
    throw new Error('Forced Error for Testing');
});


app.use(authRoutes);
app.use(userRoutes);


app.use('*', notFound);
app.use(errorHandler);

const start = (port = process.env.PORT || 5002) => {
    app.listen(port, () => {
        logger.info(`Server is running on PORT: ${port}`);
    });
};

module.exports = {
    app, 
    start,
};
