const jwt_decode = require('jwt-decode');
const { GraphQLClient, gql } = require('graphql-request');
const fs = require('fs');

/*
* Call the SatCon API to upload a new version to a channel
*/
const uploadVersion = async (token, host, filename, channelId, version) => {
    // Load file
    console.log('Uploading %s to channel %s as version %s', filename, channelId, version)
    const content = fs.readFileSync(filename, 'utf8');

    // Get orgId
    const decoded = jwt_decode(token);
    const bss = decoded.account.bss;

    const graphQLClient = new GraphQLClient(host, {
        headers: {
            authorization: 'Bearer ' + token,
        },
    });

    const addChannelVersionMutation = gql`mutation addChannelVersion($orgId: String!, $channelUuid: String!, $name: String!, $type: String!, $content: String, $file: Upload, $description: String) { addChannelVersion(orgId: $orgId, channelUuid: $channelUuid, name: $name, type: $type, content: $content, file: $file, description: $description) {success versionUuid}}`
    const variables = {
        orgId: bss,
        channelUuid: channelId,
        name: version,
        type: "application/yaml",
        file: null,
        content: content,
        description: null
    };

    try {
        const data = await graphQLClient.request(addChannelVersionMutation, variables);
        console.log('Version %s uploaded successfully', version);
        return data.addChannelVersion.versionUuid;
    } catch (error) {
        throw new Error(JSON.stringify(error));
    }
}

module.exports = { uploadVersion };
