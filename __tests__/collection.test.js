const Collection = require('../src/models/Collection');
const logger = require('../src/utils/logger');

// Mock logger to prevent actual logging during tests
jest.mock('../src/utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn(),
}));

describe('Collection class', () => {
    let collection, mockModel;

    beforeEach(() => {
        mockModel = {
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            findByPk: jest.fn(),
            update: jest.fn(),
            destroy: jest.fn(),
        };
        collection = new Collection(mockModel);
    });

    describe('create method', () => {
        it('should successfully create a record', async () => {
            const mockData = { username: 'testuser' };
            mockModel.create.mockResolvedValue(mockData);

            const result = await collection.create(mockData);
            expect(result).toEqual(mockData);
            expect(mockModel.create).toHaveBeenCalledWith(mockData);
            expect(logger.info).toHaveBeenCalled();
        });

        it('should handle errors in create method', async () => {
            mockModel.create.mockRejectedValue(new Error('Create error'));
            await expect(collection.create({})).rejects.toThrow('Error in the collection create method');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('read method', () => {
        it('should successfully read a record by id', async () => {
            const mockData = { id: 1, username: 'testuser' };
            mockModel.findOne.mockResolvedValue(mockData);

            const result = await collection.read(1);
            expect(result).toEqual(mockData);
            expect(mockModel.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(logger.info).toHaveBeenCalled();
        });

        it('should successfully read all records', async () => {
            const mockData = [{ username: 'user1' }, { username: 'user2' }];
            mockModel.findAll.mockResolvedValue(mockData);

            const result = await collection.read();
            expect(result).toEqual(mockData);
            expect(mockModel.findAll).toHaveBeenCalledWith({});
            expect(logger.info).toHaveBeenCalled();
        });

        it('should handle errors in read method', async () => {
            mockModel.findOne.mockRejectedValue(new Error('Read error'));
            await expect(collection.read(1)).rejects.toThrow('Error in the collection read method');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('update method', () => {
        it('should successfully update a record', async () => {
            const mockData = { id: 1, username: 'updatedUser' };
            const recordToUpdate = {
                update: jest.fn().mockResolvedValue(mockData)
            };
            mockModel.findByPk.mockResolvedValue(recordToUpdate);
    
            const result = await collection.update(1, { username: 'updatedUser' });
            expect(result).toEqual(recordToUpdate); // Corrected to expect recordToUpdate
            expect(recordToUpdate.update).toHaveBeenCalledWith({ username: 'updatedUser' });
            expect(logger.info).toHaveBeenCalled();
        });
    
        it('should handle record not found in update method', async () => {
            mockModel.findByPk.mockResolvedValue(null);
            await expect(collection.update(1, {})).rejects.toThrow('Error in the collection update method');
        });
    });

    describe('delete method', () => {
        it('should successfully delete a record', async () => {
            mockModel.destroy.mockResolvedValue(1); // 1 record deleted

            const result = await collection.delete(1);
            expect(result).toEqual({ message: 'Record deleted successfully' });
            expect(mockModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(logger.info).toHaveBeenCalled();
        });

        it('should handle record not found or not deleted in delete method', async () => {
            mockModel.destroy.mockResolvedValue(0); // 0 records deleted
            await expect(collection.delete(1)).rejects.toThrow('Record not found or not deleted');
            expect(logger.error).toHaveBeenCalled();
        });

        it('should handle record not found or not deleted in delete method', async () => {
            mockModel.destroy.mockResolvedValue(0); // 0 records deleted
            await expect(collection.delete(1)).rejects.toThrow('Record not found or not deleted');
            expect(logger.error).toHaveBeenCalled();
        });
        
        it('should handle unexpected errors in delete method', async () => {
            const unexpectedError = new Error('Unexpected error');
            mockModel.destroy.mockRejectedValue(unexpectedError); // Simulate an unexpected error
    
            await expect(collection.delete(1)).rejects.toThrow('Error in the collection delete method');
            expect(logger.error).toHaveBeenCalledWith('Error in the collection delete method', unexpectedError);
        });
    });

    describe('findOne method', () => {
        it('should successfully find a record', async () => {
            const mockData = { id: 1, username: 'testuser' };
            mockModel.findOne.mockResolvedValue(mockData);

            const result = await collection.findOne({ id: 1 });
            expect(result).toEqual(mockData);
            expect(mockModel.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(logger.info).toHaveBeenCalled();
        });

        it('should handle errors in findOne method', async () => {
            mockModel.findOne.mockRejectedValue(new Error('FindOne error'));
            await expect(collection.findOne({ id: 1 })).rejects.toThrow('Error in the collection findOne method');
            expect(logger.error).toHaveBeenCalled();
        });
        
        it('should successfully find a record with default options', async () => {
            const mockData = { id: 1, username: 'testuser' };
            mockModel.findOne.mockResolvedValue(mockData);
    
            const result = await collection.findOne();
            expect(result).toEqual(mockData);
            expect(mockModel.findOne).toHaveBeenCalledWith({});
            expect(logger.info).toHaveBeenCalled();
        });
    });
});
