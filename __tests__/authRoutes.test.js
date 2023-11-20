const request = require('supertest');
const { app } = require('../src/server'); 
const { userCollection } = require('../src/models');
const basicAuth = require('../src/middleware/auth/basicAuth');

jest.mock('../src/models');
jest.mock('../src/middleware/auth/basicAuth');
jest.mock('../src/utils/logger', () => {
    return {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };
});

describe('Auth Routes', () => {
  describe('POST /signup', () => {
    it('should create a new user successfully', async () => {
      const newUser = { username: 'testuser', password: 'password123', email: 'test@example.com' };
      userCollection.create.mockResolvedValue({ ...newUser, token: 'testToken' });

      const response = await request(app).post('/signup').send(newUser);
      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
    });

    it('should return a 400 status for invalid signup data', async () => {
      const response = await request(app).post('/signup').send({ username: 'testuser' });
      expect(response.status).toBe(400);
    });

    it('should handle errors during signup', async () => {
      userCollection.create.mockRejectedValue(new Error('Signup Error'));
      const response = await request(app).post('/signup').send({ username: 'testuser', password: 'password123', email: 'test@example.com' });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /signin', () => {
    it('should sign in a user successfully', async () => {
      basicAuth.mockImplementation((req, res, next) => {
        req.user = { username: 'testuser', token: 'testToken' };
        next();
      });

      const response = await request(app).post('/signin').auth('testuser', 'password123');
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('should handle errors during signin', async () => {
        // Mock the basicAuth middleware for successful authentication
        basicAuth.mockImplementation((req, res, next) => {
            req.user = { username: 'testuser', token: 'testToken' };
            // Set a flag to simulate an error condition in the route handler
            req.simulateError = true;
            next();
        });

        // Modify your /signin route to check for req.simulateError
        // and throw an error if it's true

        const response = await request(app).post('/signin').auth('testuser', 'password123');
        expect(response.status).toBe(401);
        expect(response.text).toBe("Error during user signin");
    });
  });
});
