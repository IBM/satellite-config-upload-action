# satellite-config-actions
A set of Github Actions that allow users to integrate IBM Cloud Satellite Config into their Github CI pipelines.

## Inputs

### `apikey`

**Required** The IBM Cloud API key.

### `channelUuid`

**Required** The IBM Cloud Satellite Config channelUuid.

### `filename`

**Required** The name of the file to upload.

### `versionName`

**Required** The name of the new version.

## Outputs

### `versionUuid`

The version id of the new file that was uploaded

## Example usage

uses: IBM/satellite-config-actions@v1
with:
  apikey: 'xxxxxxxxxxxxxxxxxxxx'
  filename: 'resource.yml'
  channelUuid: '12345abcdef'