const supertest = require('supertest');
const { app } = require('../src/server');
const logger = require('../src/utils/logger');

jest.mock('../src/utils/logger', () => ({
    ...jest.requireActual('../src/utils/logger'),
    error: jest.fn(),
}));

describe('500 Error Handler', () => {
    test('should return 500 for a server error', async () => {
        const response = await supertest(app).get('/error');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error: 500,
            route: '/error',
            message: 'An unexpected error occurred on the server.'
        });

        expect(logger.error).toHaveBeenCalled();
    });
});
