'use strict';

const express = require('express');
const router = express.Router();
const { userCollection } = require('../models');
const bearerAuth = require('../middleware/auth/bearerAuth');
const accessControl = require('../middleware/auth/accessControl');


// fetch all users
router.get('/users', bearerAuth, accessControl('read'), async (req, res,) => {
    try { 
        const users = await userCollection.read();
        res.json(users);
    } catch (e) {
        res.status(500).send('Server Error');
    }
});

// fetch  a speficic user by ID
router.get('/users/:id', bearerAuth, accessControl('read'), async (req, res) => {
    try {
        const user = await userCollection.read(req.params.id);
        res.json(user);
    } catch (e) {
        res.status(500).send('Server Error');
    }
});

// Update a specific User by ID
router.put('/users/:id', bearerAuth, accessControl('update'), async (req, res) => {
    try {
        const updatedUser = await userCollection.update(req.params.id, req.body);
        res.json(updatedUser);
    } catch (e) {
        res.status(500).send('Server Error');
    }
});

// Create a new user 
router.post('/users', bearerAuth, accessControl('create'), async (req, res) => {
    try {
        const newUser = await userCollection.create(req.body);
        res.status(201).json(newUser);
    } catch (e) {
        res.status(500).send('Server error');
    }
});


router.delete('/users/:id', bearerAuth, accessControl('delete'), async (req, res) => {
    try {
        await userCollection.delete(req.params.id);
        res.status(200).send('User deleted');
    } catch (e) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;