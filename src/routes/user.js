'use strict';

const express = require('express');
const router = express.Router();
const { userCollection } = require('../models');
const basicAuth = require('../middleware/auth/basicAuth');
const logger = require('../utils/logger');

// Signup route
router.post('/signup', async (req, res, next) => {
    try {
        logger.debug('Attempting to create a new user');
        let userRecord = await userCollection.create(req.body);
        logger.info(`User created successfully: ${userRecord.username}`);
        
        const output = {
            user: userRecord,
            token: userRecord.token
        };
        res.status(201).json(output);
    } catch (e) {
        logger.error(`Error during user signup: ${e.message}`);
        res.status(400).send("Error during user signup");
    }
});

// Signin route
router.post('/signin', basicAuth, (req, res, next) => {
    try {
        logger.info(`User signed in successfully: ${req.user.username}`);
        const user = {
            user: req.user,
            token: req.user.token
        };
        res.status(200).json(user);
    } catch (e) {
        logger.error(`Error during user signin: ${e.message}`);
        res.status(401).send("Error during user signin");
    }
});

module.exports = router;
