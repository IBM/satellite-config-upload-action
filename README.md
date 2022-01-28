# satellite-config-actions

A set of Github Actions to integrate IBM Cloud [Satellite Config](https://cloud.ibm.com/docs/satellite?topic=satellite-cluster-config) into CI/CD pipeline.

A typical use case is:

  1. upload a Kubernetes resource as a new version to your Satellite Config channel (configuration)
  2. create a subscription for the new version
  3. Satellite Config will deploy the new version to all subscribers (clusters)

This action performs step 1 above.

## Inputs

### `apikey`

**Required** The IBM Cloud API key.

### `channelUuid`

**Required** The IBM Cloud Satellite Config channelUuid.

### `filename`

**Required** The name of the resource file to upload.

### `versionName`

**Required** The name of the new version.

### `satelliteHost`

**Optional** The IBM Cloud Satellite API endpoint. Defaults to `https://config.satellite.cloud.ibm.com/graphql`

### `tokenHost`

**Optional** IBM Cloud IAM endpoint. Defaults to `https://iam.cloud.ibm.com/identity/token`

## Outputs

### `versionUuid`

The version id of the new file that was uploaded.

## Example usage

In the example below, `IBM_API_KEY` and `SATCON_CONFIG_ID` are [GitHub secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

```bash
name: Satellite Config Action Demo
on: [push]
jobs:
  Explore-Satellite-Config-Actions:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository code
        uses: actions/checkout@v2
      - name: Create new version in satellite config
        uses: IBM/satellite-config-upload-action@v1alpha4
        with:
          apikey: ${{ secrets.IBM_API_KEY }}
          channelUuid: ${{ secrets.SATCON_CONFIG_ID }}
          filename: 'test-job.yml'
          versionName: 'version-1'
```
