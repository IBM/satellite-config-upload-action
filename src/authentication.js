const fetch = require('node-fetch');

/*
* Get the IAM bearer token using an API key
*/
const authenticate = async (tokenHost, apikey) => {
    console.log('Authenticate with IBM Cloud');
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    params.append('apikey', apikey);

    const response = await fetch(tokenHost, { method: 'POST', body: params });
    if (!response.ok) throw new Error(`authentication failed: ${response.statusText}`);
    const json = await response.json();
    const bearer = json.access_token;

    return bearer;
}

module.exports = { authenticate };
