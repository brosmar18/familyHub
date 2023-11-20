'use strict';

const express = require('express');
const router = express.Router();
const { eventCollection } = require('../models');
const bearerAuth = require('../middleware/auth/bearerAuth');
const accessControl = require('../middleware/auth/accessControl');

// Create a new event
router.post('/events', bearerAuth, accessControl('create'), async (req, res) => {
    try {
        const newEvent = await eventCollection.create(req.body);
        res.status(201).json(newEvent);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Read all events
router.get('/events', bearerAuth, accessControl('read'), async (req, res) => {
    try {
        const events = await eventCollection.read();
        res.json(events);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Read a specific event by ID
router.get('/events/:id', bearerAuth, accessControl('read'), async (req, res) => {
    try {
        const event = await eventCollection.read(req.params.id);
        res.json(event);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Update a specific event by ID
router.put('/events/:id', bearerAuth, accessControl('update'), async (req, res) => {
    try {
        const updatedEvent = await eventCollection.update(req.params.id, req.body);
        res.json(updatedEvent);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Delete a specific event by ID
router.delete('/events/:id', bearerAuth, accessControl('delete'), async (req, res) => {
    try {
        await eventCollection.delete(req.params.id);
        res.status(200).send('Event deleted');
    } catch (e) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
