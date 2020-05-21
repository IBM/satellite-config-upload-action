# satellite-config-actions
A set of Github Actions that allow users to integrate IBM Cloud Satellite Config into their Github CI pipelines.

## Inputs

### `apikey`

**Required** The IBM Cloud API key.

### `channel_id`

**Required** The IBM Cloud Satellite Config channel_id.

### `filename`

**Required** The name of the file to upload.

### `version_name`

**Required** The name of the new version.

## Outputs

### `version_id`

The version id of the new file that was uploaded

## Example usage

uses: IBM/satellite-config-actions@v1
with:
  apikey: 'xxxxxxxxxxxxxxxxxxxx'
  filename: 'resource.yml'
  channel_id: '12345abcdef'