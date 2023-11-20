const supertest = require('supertest');
const express = require('express');
const userRouter = require('../src/routes/users');
const { userCollection } = require('../src/models');

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

// Mocking the userCollection
jest.mock('../src/models', () => ({
    userCollection: {
        create: jest.fn(),
        read: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('User Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(userRouter);
    });

    // Tests for GET /users
    describe('GET /users', () => {
        // Success case
        it('should return all users', async () => {
            userCollection.read.mockResolvedValue([{ username: 'user1' }, { username: 'user2' }]);
            const response = await supertest(app).get('/users');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ username: 'user1' }, { username: 'user2' }]);
        });

        // Error handling
        it('should handle errors', async () => {
            userCollection.read.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).get('/users');
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server Error');
        });
    });

    // Tests for GET /users/:id
    describe('GET /users/:id', () => {
        // Success case
        it('should return a specific user', async () => {
            userCollection.read.mockResolvedValue({ username: 'user1' });
            const response = await supertest(app).get('/users/1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ username: 'user1' });
        });

        // Error handling
        it('should handle errors', async () => {
            userCollection.read.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).get('/users/1');
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server Error');
        });
    });

    // Tests for POST /users
    describe('POST /users', () => {
        // Success case
        it('should create a new user', async () => {
            userCollection.create.mockResolvedValue({ username: 'newUser' });
            const response = await supertest(app).post('/users').send({ username: 'newUser', password: 'pass123', email: 'new@example.com' });
            expect(response.status).toBe(201);
            expect(response.body).toEqual({ username: 'newUser' });
        });

        // Error handling
        it('should handle errors', async () => {
            userCollection.create.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).post('/users').send({ username: 'newUser', password: 'pass123', email: 'new@example.com' });
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server error');
        });
    });

    // Tests for PUT /users/:id
    describe('PUT /users/:id', () => {
        // Success case
        it('should update a specific user', async () => {
            userCollection.update.mockResolvedValue({ username: 'updatedUser' });
            const response = await supertest(app).put('/users/1').send({ username: 'updatedUser' });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ username: 'updatedUser' });
        });

        // Error handling
        it('should handle errors', async () => {
            userCollection.update.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).put('/users/1').send({ username: 'updatedUser' });
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server Error');
        });
    });

    // Tests for DELETE /users/:id
    describe('DELETE /users/:id', () => {
        // Success case
        it('should delete a specific user', async () => {
            userCollection.delete.mockResolvedValue();
            const response = await supertest(app).delete('/users/1');
            expect(response.status).toBe(200);
            expect(response.text).toBe('User deleted');
        });

        // Error handling
        it('should handle errors', async () => {
            userCollection.delete.mockRejectedValue(new Error('Server Error'));
            const response = await supertest(app).delete('/users/1');
            expect(response.status).toBe(500);
            expect(response.text).toBe('Server Error');
        });
    });
});
