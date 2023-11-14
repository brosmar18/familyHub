const supertest = require('supertest');
const { app } = require('../../src/server');

const request = supertest(app);

describe('Server API', () => {
    test('Get / responds with status code 200 and message "Hello World!"', async () => {
        const response = await request.get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Hello World!");
    });
});