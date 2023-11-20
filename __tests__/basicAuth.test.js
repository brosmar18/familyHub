const basicAuth = require('../src/middleware/auth/basicAuth');
const { userCollection } = require('../src/models');
const bcrypt = require('bcrypt');

jest.mock('../src/models');
jest.mock('bcrypt');

describe('Basic Authentication Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = { headers: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    nextFunction.mockClear();
  });

  it('authenticates valid credentials', async () => {
    mockRequest.headers.authorization = 'Basic ' + Buffer.from('testuser:password').toString('base64');
    userCollection.findOne.mockResolvedValue({ username: 'testuser', password: 'hashedpassword' });
    bcrypt.compare.mockResolvedValue(true);

    await basicAuth(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('rejects invalid username', async () => {
    mockRequest.headers.authorization = 'Basic ' + Buffer.from('invaliduser:password').toString('base64');
    userCollection.findOne.mockResolvedValue(null);

    await basicAuth(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.send).toHaveBeenCalledWith("Not Authorized (user doesn't exist in DB)");
  });

  it('rejects invalid password', async () => {
    mockRequest.headers.authorization = 'Basic ' + Buffer.from('testuser:wrongpassword').toString('base64');
    userCollection.findOne.mockResolvedValue({ username: 'testuser', password: 'hashedpassword' });
    bcrypt.compare.mockResolvedValue(false);

    await basicAuth(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.send).toHaveBeenCalledWith("Not Authorized (password incorrect)");
  });

  it('handles requests without authorization header', async () => {
    await basicAuth(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith("No authorization header provided");
  });

  it('handles errors during authentication', async () => {
    mockRequest.headers.authorization = 'Basic ' + Buffer.from('testuser:password').toString('base64');
    userCollection.findOne.mockRejectedValue(new Error('DB error'));

    await basicAuth(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
});
