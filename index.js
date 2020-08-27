

import { getInput, setOutput, setFailed } from '@actions/core';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import jwtDecode from 'jwt-decode';

/*
* Get the IAM bearer token using an API key
*/
const getBearer = async (apikey) => {
    console.log( 'Signing in to IBM Cloud' );
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    params.append('apikey', apikey);
    const response = await fetch('https://iam.test.cloud.ibm.com/identity/token', { method: 'POST', body: params });
    const json = await response.json();
    const bearer = json.access_token;
    return bearer;
}

/*
* Call the SatCon API to upload a new version to a channel
*/
const uploadVersion = async (token, filename, channelId, version) => {
    // Load file
    console.log( 'Uploading %s to channel %s as version %s', filename, channelId, version )
    const content = readFileSync(filename, 'utf8');

    // Build the content package
    const jwt = jwtDecode(token);
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
            "content": null,
            "description": null
        },
        "operationName": "addChannelVersion"
    };

    // Call API
    const headers = { 'content-type': 'application/json', 'authorization': 'Bearer ' + token };
    const fetchResponse = await fetch('https://api.razee.test.cloud.ibm.com/graphql', { method: 'POST', headers: headers, body: JSON.stringify(request) })
    const response = await fetchResponse.json();
    if ( response.errors ) {
        throw new Error (response.errors[0].message);
    }
    console.log( 'Version ID %s', response.data.addChannelVersion.versionUuid );
    return response.data.addChannelVersion.versionUuid;
}

async function main() {
    try {
        // get the Bearer token
        const apikey = getInput('apikey');
        if ( !apikey ) {
            throw new Error('Missing apikey');
        }
        const bearer = await getBearer(apikey);

        // upload the file
        const filename = getInput('filename');
        const channelId = getInput('channelUuid');
        const versionName = getInput('versionName');
        const versionid = await uploadVersion(bearer, filename, channelId, versionName);

        setOutput("versionid", versionid);
    } catch (error) {
        setFailed(error.message);
    }
}

main();