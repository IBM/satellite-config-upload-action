const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const fs = require('fs');
const jwtDecode = require('jwt-decode');

const getBearer = async (apikey) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    params.append('apikey', apikey);
    const response = await fetch('https://iam.test.cloud.ibm.com/identity/token', { method: 'POST', body: params });
    const json = await response.json();
    const bearer = json.access_token;
    return bearer;
}

const uploadVersion = async (token, filename, channelId, version) => {
    // Load file
    const content = fs.readFileSync(filename, 'utf8');

    // Build the content package
    const jwt = jwtDecode(token);
    const bss = jwt.account.bss;
    const request =
    {
        "query": "mutation addChannelVersion($org_id: String!, $channel_id: String!, $name: String!, $type: String!, $content: String!, $description: String) { addChannelVersion(org_id: $org_id, channel_uuid: $channel_id, name: $name, type: $type, content: $content, description: $description) {success version_uuid}}",
        "variables":
        {
            "org_id": bss,
            "channel_id": channelId,
            "name": version,
            "type": "application/yaml",
            "content": content,
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
    return response.data.addChannelVersion.version_uuid;
}

async function main() {
    try {
        // get the Bearer token
        const apikey = core.getInput('apikey');
        if ( !apikey ) {
            throw new Error('Missing apikey');
        }
        const bearer = await getBearer(apikey);

        // upload the file
        const buildId = github.context.buildid;
        const filename = core.getInput('filename');
        const channelId = core.getInput('channel_id');
        const versionName = core.getInput('version_name');
        const versionid = await uploadVersion(bearer, filename, channelId, buildId);

        core.setOutput("versionid", versionid);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();