const supertest = require('supertest');
const { app, start } = require('../../src/server');
const logger = require('../../src/utils/logger');

// Mock the logger to prevent actual logging during tests
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
}));

describe('Server API', () => {
    let originalPort;
    let testPort;

    beforeAll(() => {
        // Store the original PORT value
        originalPort = process.env.PORT;
        // Define a test port or use the one from .env if it exists for the test
        testPort = process.env.PORT || '5002';
    });

    afterAll(() => {
        // Restore the original PORT value after the tests
        process.env.PORT = originalPort;
    });

    test('Get / responds with status code 200 and message "Hello World!"', async () => {
        const response = await supertest(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Hello World!");
    });

    test('Server starts on the correct PORT', () => {
        const listenMock = jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
            callback();
        });
        start();
        expect(listenMock).toHaveBeenCalledWith(testPort, expect.any(Function));
        listenMock.mockRestore();
    });

    test('Server logs the startup message', () => {
        const listenMock = jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
            callback();
        });
        start();
        expect(logger.info).toHaveBeenCalledWith(`Server is running on PORT: ${testPort}`);
        listenMock.mockRestore();
    });

    // Fallback to default port if process.env.PORT is not set
    test('Fallback to default port if process.env.PORT is not set', () => {
        // Unset the PORT for this test
        delete process.env.PORT;
        const listenMock = jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
            callback();
        });
        start(); 
        expect(listenMock).toHaveBeenCalledWith(5002, expect.any(Function)); 
        listenMock.mockRestore();
    });
});
