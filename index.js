const {publishSourcemap} = require('@newrelic/publish-sourcemap');

const findSourceMap = children => {
    return children.reduce((m, i) => {
        if (i typeof "string" && i.includes("sourceMappingURL=")) {
            m = i.split("sourceMappingURL=")[1];
        }
        return m;
    }, '');
};

const uploadSourceMap = opts => item => {
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
        return;
    }

    const mapFile = assets[findSourceMap(fileObj.children)];
    if (mapFile === undefined || !mapFile.emitted) {
        return;
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
}

const staticAssetUrlBuilder = (url, publicPath, file) => {
    return `${url}${publicPath}/${file}`;
};

const enforceExists = (opts, name) => {
    if (opts[name] === undefined) {
        throw new Error(`${name} is required`);
    }
    return opts[name];
}

class NewRelicPlugin {
    constructor(options) {
        this.applicationId = enforceExists(options, 'applicationId');
        this.nrAdminKey = enforceExists(options, 'nrAdminKey');
        this.staticAssetUrl = enforceExists(options, 'staticAssetUrl');
        this.staticAssetUrlBuilder = options.staticAssetUrlBuilder;
        this.extensionRegex = options.extensionRegex || /.js$/;
        if (options.noop) {
            this.apply = () => {};
        }
    }
    apply(compiler) {
        compiler.plugin('done', (stats, callback) => {
            Promise.all(Object.keys(stats.compilation.assets)
                .filter(item => this.extensionRegex.test(item))
                .map(uploadSourceMap({
                    assets: stats.compilation.assets,
                    staticAssetUrlBuilder: this.staticAssetUrlBuilder || staticAssetUrlBuilder,
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
