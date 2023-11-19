'use strict';

const express = require('express');
const router = express.Router();
const { userCollection } = require('../models');
const basicAuth = require('../middleware/auth/basidAuth');

router.post('/signup', async (req, res, next) => {
    try {
        let userRecord = await userCollection.create(req.body);
        const output = {
            user: userRecord,
            token: userRecord.token
        };
        res.status(201).json(output);
    } catch (e) {
        next(e.message);
    }
});

router.post('/signin', basicAuth, (req, res, nexxt) => {
    const user = {
        user: req.user,
        token: req.user.token
    };
    res.status(200).json(user);
});

module.exports = router;