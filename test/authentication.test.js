jest.mock('node-fetch');
const fetch = require('node-fetch');
const { Response } = jest.requireActual('node-fetch');
const { authenticate } = require('../src/authentication');


test('Authenticate with invalid API key', async () => {
    var response = new Response(null, { "status": 401 });
    fetch.mockReturnValue(Promise.resolve(response));
    await expect(authenticate('https://iam.cloud.ibm.com/identity/token', 'api-key')).rejects.toThrow('authentication failed');
});

test('Authenticate with valid API key', async () => {
    const obj = { access_token: 'token' };
    var response = new Response(JSON.stringify(obj), { "status": 200 });
    fetch.mockReturnValue(Promise.resolve(response));
    var token = await authenticate('https://iam.cloud.ibm.com/identity/token', 'api-key');
    expect(token).toBe('token');
});


