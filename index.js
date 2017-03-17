"use strict";
const {publishSourcemap} = require('@newrelic/publish-sourcemap');
const uploadSourceMap = require('./src/uploadSourceMap');
const staticAssetUrlBuilder = require('./src/staticAssetUrlBuilder');
const enforceExists = require('./src/enforceExists');

class NewRelicPlugin {
    constructor(options) {
        this.applicationId = enforceExists(options, 'applicationId');
        this.nrAdminKey = enforceExists(options, 'nrAdminKey');
        this.staticAssetUrl = enforceExists(options, 'staticAssetUrl');
        this.staticAssetUrlBuilder = options.staticAssetUrlBuilder || staticAssetUrlBuilder;
        this.extensionRegex = options.extensionRegex || /\.js$/;
        if (options.noop) {
            this.apply = () => {};
        }
    }
    apply(compiler) {
        return compiler.plugin('done', (stats) => {
            return Promise.all(Object.keys(stats.compilation.assets)
                .filter(item => this.extensionRegex.test(item))
                .map(uploadSourceMap({
                    assets: stats.compilation.assets,
                    staticAssetUrlBuilder: this.staticAssetUrlBuilder,
                    url: this.staticAssetUrl,
                    publicPath: stats.compilation.outputOptions.publicPath,
                    nrAdminKey: this.nrAdminKey,
                    applicationId: this.applicationId,
                    stats
                })))
                .then((values) => {
                    values.forEach(v => console.log(`sourceMap for ${v} uploaded to newrelic`));
                }).catch((err) => {
                    console.log(err);
                });
        });
    }
};


module.exports = NewRelicPlugin;
