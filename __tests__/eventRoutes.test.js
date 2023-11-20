const supertest = require('supertest');
const express = require('express');
const eventRouter = require('../src/routes/event');
const { eventCollection } = require('../src/models');

// Mocking the middleware
jest.mock('../src/middleware/auth/bearerAuth', () => (req, res, next) => {
    req.user = { username: 'testuser', capabilities: ['read', 'create', 'update', 'delete'] };
    next();
});

jest.mock('../src/middleware/auth/accessControl', () => (capability) => (req, res, next) => {
    if (req.user.capabilities.includes(capability)) {
        next();
    } else {
        res.status(403).send('Access Denied');
    }
});

// Mocking the eventCollection
jest.mock('../src/models', () => ({
    eventCollection: {
        create: jest.fn(),
        read: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('Event Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(eventRouter);
    });

    // Tests for POST /events
    describe('POST /events', () => {
        it('should create a new event', async () => {
            eventCollection.create.mockResolvedValue({ id: 1, name: 'New Event' });
            const response = await supertest(app).post('/events').send({ name: 'New Event' });
            expect(response.status).toBe(201);
            expect(response.body).toEqual({ id: 1, name: 'New Event' });
        });

        it('should handle errors on creating an event', async () => {
            eventCollection.create.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).post('/events').send({ name: 'New Event' });
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server error');
        });
    });

    // Tests for GET /events
    describe('GET /events', () => {
        it('should return all events', async () => {
            eventCollection.read.mockResolvedValue([{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }]);
            const response = await supertest(app).get('/events');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }]);
        });

        it('should handle errors on fetching all events', async () => {
            eventCollection.read.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).get('/events');
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server error');
        });
    });

    // Tests for GET /events/:id
    describe('GET /events/:id', () => {
        it('should return a specific event by ID', async () => {
            eventCollection.read.mockResolvedValue({ id: 1, name: 'Specific Event' });
            const response = await supertest(app).get('/events/1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 1, name: 'Specific Event' });
        });

        it('should handle errors on fetching a specific event', async () => {
            eventCollection.read.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).get('/events/1');
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server error');
        });
    });

    // Tests for PUT /events/:id
    describe('PUT /events/:id', () => {
        it('should update a specific event by ID', async () => {
            eventCollection.update.mockResolvedValue({ id: 1, name: 'Updated Event' });
            const response = await supertest(app).put('/events/1').send({ name: 'Updated Event' });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 1, name: 'Updated Event' });
        });

        it('should handle errors on updating an event', async () => {
            eventCollection.update.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).put('/events/1').send({ name: 'Updated Event' });
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server error');
        });
    });

    // Tests for DELETE /events/:id
    describe('DELETE /events/:id', () => {
        it('should delete a specific event by ID', async () => {
            eventCollection.delete.mockResolvedValue();
            const response = await supertest(app).delete('/events/1');
            expect(response.status).toBe(200);
            expect(response.text).toBe('Event deleted');
        });

        it('should handle errors on deleting an event', async () => {
            eventCollection.delete.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).delete('/events/1');
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server error');
        });
    });
});
