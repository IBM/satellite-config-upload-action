jest.mock('graphql-request');
const { GraphQLClient } = require('graphql-request');
const { uploadVersion } = require('../src/satcon-upload');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJhY2NvdW50Ijp7ImJzcyI6InRlc3QifX0.kwB62g9Q0grSM9LcneeFuoW0RwwaK_bhQYpaaGPp9kI';
const file = './test/test.yml';
beforeEach(() => {
    GraphQLClient.mockClear();
});

describe('Failed uploads', () => {
    beforeAll(() => {
        GraphQLClient.mockImplementation(() => {
            return {
                request: () => { throw new Error("The version name already exists"); }
            };
        });
    });

    test('Upload a duplicate version', async () => {
        await expect(uploadVersion(token, 'host', file, 'channelId', 'version-1')).rejects.toThrow();
    });
});

describe('Successful uploads', () => {
    beforeAll(() => {
        GraphQLClient.mockImplementation(() => {
            return {
                request: () => { return { 'addChannelVersion': { 'versionUuid': 'uuid' } } }
            };
        });
    });

    test('Successfully upload a new version', async () => {
        var versionUuid = await uploadVersion(token, 'host', file, 'channelId', 'version-1');
        expect(versionUuid).toBe('uuid');
    });
});
