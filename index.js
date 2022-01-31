const core = require('@actions/core');
const { authenticate } = require('./authentication');
const { uploadVersion } = require('./satcon-upload');

async function run() {
    try {
        const apikey = core.getInput('apikey');
        const tokenHost = core.getInput('tokenHost');
        const host = core.getInput('satelliteHost');
        const filename = core.getInput('filename');
        const channelUuid = core.getInput('channelUuid');
        const versionName = core.getInput('versionName');

        const bearer = await authenticate(tokenHost, apikey);

        const versionUuid = await uploadVersion(bearer, host, filename, channelUuid, versionName);

        core.setOutput("versionUuid", versionUuid);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
