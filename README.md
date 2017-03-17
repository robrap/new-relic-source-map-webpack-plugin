# new-relic-source-map-webpack-plugin
Upload source maps to new relic as part of a webpack build.


## Install

`yarn add new-relic-source-map-webpack-plugin --dev`
or
`npm install new-relic-source-map-webpack-plugin --save-dev`

## Setup

Instantiate the plugin and add it to your plugins array.

`applicationId`, `nrAdminKey`, and `staticAssetUrl` are required.  Full list of options in the next section.

```js
const NewRelicSourceMapPlugin = require('new-relic-source-map-webpack-plugin');

module.exports = {
    ...webpackConfig,
    plugins: [
        ...yourPlugins,
        new NewRelicSourceMapPlugin({
            applicationId: 'YOUR NEW RELIC APP ID',
            nrAdminKey: 'YOUR NEW RELIC ADMIN KEY',
            staticAssetUrl: 'http://examplecdn.com',
            noop: process.env.NODE_ENV !== 'production' // only upload assets during production builds
        })
    ]   
}
```

## Customize

| Property       | Type           | Description  |
| ------------- |:-------------:| -----:|
| applicationId     | string | applicationId as defined [here](https://docs.newrelic.com/docs/browser/new-relic-browser/installation-configuration/copy-browser-monitoring-license-key-app-id) |
| nrAdminKey     | string |   Admin Key as defined [here](https://docs.newrelic.com/docs/apis/rest-api-v2/requirements/api-keys) |
| staticAssetUrl | string | the domain your production assets are served from. Written as a complete url. Example: "https://www.examplecdn.com" |
| staticAssetUrlBuilder | function | A function for building the production url your js file is built from.  Will be called for every javascript file with four arguments: staticAssetUrl, the public path from your webpack config, the filename, and the [webpack stats instance](https://github.com/webpack/webpack/blob/master/lib/Stats.js).  Defaults to `${removeLastCharIfSlash(url)}${removeLastCharIfSlash(publicPath)}/${file}` |
| extensionRegex | regex | a regex used to find js files. Defaults to `/\.js$/` |
| noop | boolean | control boolean that decides whether or not to run the plugin. Set to true for builds where you don't want to upload assets to new relic. |
