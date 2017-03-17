const findSourceMap = require('./findSourceMap');
const {publishSourcemap} = require('@newrelic/publish-sourcemap');

module.exports = opts => item => {
    const {
        assets,
        staticAssetUrlBuilder,
        publicPath,
        applicationId,
        nrAdminKey,
        url,
        stats
    } = opts;

    const fileObj = assets[item];
    if (!fileObj.children) {
        return new Promise(res => res());
    }

    const mapFile = assets[findSourceMap(fileObj.children)];
    if (mapFile === undefined || !mapFile.emitted) {
        return new Promise(res => res());
    }

    const javascriptUrl = staticAssetUrlBuilder(url, publicPath, item, stats);
    return new Promise((resolve, reject) => {
        publishSourcemap({
            sourcemapPath: mapFile.existsAt,
            javascriptUrl,
            applicationId,
            nrAdminKey
        }, (err) => {
            if (err) {
                reject(err);
            }
            resolve(javascriptUrl);
        });
    });
};
