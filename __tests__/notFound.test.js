jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
}));


const supertest = require('supertest');
const { app } = require('../src/server');
const logger = require('../src/utils/logger');




describe('404 Not Found Handler', () => {

    test('should return 404 for an unknown GET route', async () => {
        const response = await supertest(app).get('/this-route-does-not-exist');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: 404,
            route: '/this-route-does-not-exist',
            method: 'GET',
            message: 'The requested resource was not found on this server.'
        });
        expect(logger.warn).toHaveBeenCalledWith('404 - Not Found - GET /this-route-does-not-exist');
    });

    test('should return 404 for an unknown POST route', async () => {
        const response = await supertest(app).post('/this-route-does-not-exist');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: 404,
            route: '/this-route-does-not-exist',
            method: 'POST',
            message: 'The requested resource was not found on this server.'
        });
        expect(logger.warn).toHaveBeenCalledWith('404 - Not Found - POST /this-route-does-not-exist');
    });
});
