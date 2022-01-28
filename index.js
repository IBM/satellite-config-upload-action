const core = require('@actions/core');
const fetch = require('node-fetch');
const jwt_decode = require('jwt-decode');
const fs = require('fs');

/*
* Get the IAM bearer token using an API key
*/
const authenticate = async (tokenHost, apikey) => {
    console.log('Signing in to IBM Cloud');
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    params.append('apikey', apikey);

    const response = await fetch(tokenHost, { method: 'POST', body: params });
    if (!response.ok) throw new Error(`authentication failed: ${response.statusText}`);
    const json = await response.json();
    const bearer = json.access_token;

    return bearer;
}

/*
* Call the SatCon API to upload a new version to a channel
*/
const uploadVersion = async (token, host, filename, channelId, version) => {
    // Load file
    console.log('Uploading %s to channel %s as version %s', filename, channelId, version)
    const content = fs.readFileSync(filename, 'utf8');

    // Build the content package
    const jwt = jwt_decode(token);
    const bss = jwt.account.bss;
    const request =
    {
        "query": "mutation addChannelVersion($orgId: String!, $channelUuid: String!, $name: String!, $type: String!, $content: String, $file: Upload, $description: String) { addChannelVersion(orgId: $orgId, channelUuid: $channelUuid, name: $name, type: $type, content: $content, file: $file, description: $description) {success versionUuid}}",
        "variables":
        {
            "orgId": bss,
            "channelUuid": channelId,
            "name": version,
            "type": "application/yaml",
            "file": null,
            "content": content,
            "description": null
        },
        "operationName": "addChannelVersion"
    };

    // Call API
    const headers = { 'content-type': 'application/json', 'authorization': 'Bearer ' + token };
    const fetchResponse = await fetch(host, { method: 'POST', headers: headers, body: JSON.stringify(request) })
    const response = await fetchResponse.json();
    if (response.errors) {
        throw new Error(response.errors[0].message);
    }
    console.log('Version %s uploaded successfully', response.data.addChannelVersion.versionUuid);
    return response.data.addChannelVersion.versionUuid;
}

async function run() {
    try {
        // get the Bearer token
        const apikey = core.getInput('apikey');
        if (!apikey) {
            throw new Error('Missing apikey');
        }

        const tokenHost = core.getInput('tokenHost');
        const bearer = await authenticate(tokenHost, apikey);

        // upload the file
        const host = core.getInput('satelliteHost');
        const filename = core.getInput('filename');
        const channelUuid = core.getInput('channelUuid');
        const versionName = core.getInput('versionName');
        const versionUuid = await uploadVersion(bearer, host, filename, channelUuid, versionName);

        core.setOutput("versionUuid", versionUuid);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
