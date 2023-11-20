const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../src/utils/logger');
const { Sequelize, DataTypes } = require('sequelize');

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));
jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));


const mockFindOne = jest.fn();
const mockBuild = jest.fn();

jest.mock('sequelize', () => {
    const actualSequelize = jest.requireActual('sequelize');
    const jwt = require('jsonwebtoken'); 

    return {
        ...actualSequelize,
        Sequelize: jest.fn().mockImplementation(() => ({
            define: jest.fn().mockImplementation((modelName, attributes, options) => {
                
                const ENUM = (values) => ({
                    type: 'ENUM',
                    values,
                });

                
                const mockAttributes = {
                    ...attributes,
                    role: {
                        ...ENUM(['user', 'writer', 'editor', 'admin']),
                        defaultValue: 'user' 
                    }
                };


                const hooks = options.hooks;

                return {
                    attributes: mockAttributes,
                    options: {
                        hooks: hooks
                    },
                    build: jest.fn().mockImplementation((props) => ({
                        ...props,
                        get token() {
                            return jwt.sign({ username: this.username }, 'secretString', { expiresIn: '15h' });
                        },
                        set token(value) {
                            throw new Error('Cannot set token directly');
                        },
                        get capabilities() {
                            const acl = {
                                user: ['read'],
                                writer: ['read', 'create'],
                                editor: ['read', 'create', 'update'],
                                admin: ['read', 'create', 'update', 'delete']
                            };
                            return acl[this.role];
                        }
                    })),
                    findOne: mockFindOne,
                    authenticateBearer: jest.fn(),
                };
            })
        })),
    };
});



const UserModel = require('../src/models/User');


describe('User Model', () => {
    let User;

    beforeAll(() => {
        const sequelize = new Sequelize('sqlite::memory:');
        User = UserModel(sequelize, DataTypes);
    });

    describe('Model Initialization', () => {
        it('should initialize with correct attributes', () => {
            expect(User.attributes.username.type).toBe(DataTypes.STRING);
            expect(User.attributes.password.type).toBe(DataTypes.STRING);
            expect(User.attributes.email.type).toBe(DataTypes.STRING);
            expect(User.attributes.email.validate.isEmail).toBeTruthy();
            expect(User.attributes.role.values).toEqual(['user', 'writer', 'editor', 'admin']);
            expect(User.attributes.role.defaultValue).toBe('user');
            expect(User.attributes.token).toBeDefined();
            expect(User.attributes.capabilities).toBeDefined();
        });
    });

    describe('Virtual Fields', () => {
        it('should create a valid token', () => {
            const userInstance = User.build({ username: 'testUser' });
            jwt.sign.mockReturnValue('token');
            expect(userInstance.token).toBe('token');
            expect(jwt.sign).toHaveBeenCalledWith({ username: 'testUser' }, expect.any(String), expect.any(Object));
        });

        it('should not allow setting the token directly', () => {
            const userInstance = User.build({ username: 'testUser' });
            expect(() => {
                userInstance.token = 'newToken';
            }).toThrowError(); 
        });
        
        

        it('should return correct capabilities', () => {
            const userInstance = User.build({ role: 'admin' });
            expect(userInstance.capabilities).toEqual(['read', 'create', 'update', 'delete']);
        });
    });

    describe('beforeCreate Hook', () => {
        it('should hash the password before creating a user', async () => {
            const userInstance = User.build({ password: 'plainPassword' });
            bcrypt.hash.mockResolvedValue('hashedPassword');


            const beforeCreateHook = User.options.hooks.beforeCreate;
            await beforeCreateHook(userInstance);

            expect(userInstance.password).toBe('hashedPassword');
            expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', expect.any(Number));
        });
    });
    
    describe('authenticateBearer Method', () => {
        it('should authenticate user with a valid token', async () => {
            jwt.verify.mockReturnValue({ username: 'testUser' });
            mockFindOne.mockResolvedValue({ username: 'testUser' });

            const result = await User.authenticateBearer('validToken');
            expect(result).toEqual({ username: 'testUser' });
        });

        it('should throw error for invalid token', async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(User.authenticateBearer('invalidToken')).rejects.toThrow('Invalid token');
        });

        it('should throw error if user is not found', async () => {
            jwt.verify.mockReturnValue({ username: 'unknownUser' });
            mockFindOne.mockResolvedValue(null);

            await expect(User.authenticateBearer('validToken')).rejects.toThrow('User Not Found');
        });
    });
});

