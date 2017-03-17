jest.mock('../src/uploadSourceMap', () => jest.fn());
const NewRelicPlugin = require('../index.js');
const uploadSourceMap = require('../src/uploadSourceMap');
const compiler = {
    plugin: jest.fn()
};
beforeEach(() => {
    jest.clearAllMocks();
});

test('it throw an error if there is no application id', () => {
    const testFn = () => {
        new NewRelicPlugin({
            nrAdminKey: 'key',
            staticAssetUrl: 'url'
        });
    };
    expect(testFn).toThrowError("applicationId is required");
});

test('it throw an error if there is no staticAssetUrl', () => {
    const testFn = () => {
        new NewRelicPlugin({
            nrAdminKey: 'key',
            applicationId: 'id'
        });
    };
    expect(testFn).toThrowError("staticAssetUrl is required");
});

test('it throw an error if there is no nrAdminKey', () => {
    const testFn = () => {
        new NewRelicPlugin({
            applicationId: 'key',
            staticAssetUrl: 'url'
        });
    };
    expect(testFn).toThrowError("nrAdminKey is required");
});

test('it accepts a user defined staticAssetUrlBuilder', () => {
    const staticAssetUrlBuilder = () => {};
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url',
        staticAssetUrlBuilder
    });
    expect(nr.staticAssetUrlBuilder).toBe(staticAssetUrlBuilder);
});

test('it defaults the staticAssetUrlBuilder to the module', () => {
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url'
    });
    expect(nr.staticAssetUrlBuilder).toBe(require('../src/staticAssetUrlBuilder'));
});

test('it accepts a user defined extensionRegex', () => {
    const extensionRegex = /test/
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url',
        extensionRegex
    });
    expect(nr.extensionRegex).toBe(extensionRegex);
});

test('it defaults the extensionRegex to /.js$/', () => {
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url',
    });
    expect(nr.extensionRegex).toEqual(/\.js$/);
});

test('if noop is passed it sets apply to a noop', () => {
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url',
        noop: true
    });
    nr.apply();
    expect(uploadSourceMap).not.toBeCalled();
});

test('apply adds a callback to the compiler done event', () => {
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url',
    });
    nr.apply(compiler);
    expect(compiler.plugin).toBeCalledWith('done', expect.any(Function));
});

test('it filters the assets using the extension regex', () => {
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url',
    });
    const uploader = jest.fn();
    const stats = {
        compilation: {
            assets: {
                'something': {},
                'somethingelse': {},
                'something.js': {},
                'somethingelse.js': {}
            },
            outputOptions: {
                publicPath: 'path'
            }
        }
    };
    compiler.plugin.mockImplementation((name, cb) => {
        cb(stats);
    });
    uploadSourceMap.mockImplementation(() => {
        return uploader;
    })
    nr.apply(compiler);
    expect(uploader.mock.calls.length).toEqual(2);
});

it('passes needed configs to uploadSourceMap', () => {
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url',
    });
    const stats = {
        compilation: {
            assets: {},
            outputOptions: {
                publicPath: 'path'
            }
        }
    };
    compiler.plugin.mockImplementation((name, cb) => {
        cb(stats);
    });
    nr.apply(compiler);
    expect(uploadSourceMap).toBeCalledWith({
        assets: stats.compilation.assets,
        staticAssetUrlBuilder: nr.staticAssetUrlBuilder,
        url: nr.staticAssetUrl,
        publicPath: 'path',
        nrAdminKey: nr.nrAdminKey,
        applicationId: nr.applicationId,
        stats
    });
});

test('it logs the upload message for every uploaded file', () => {
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url',
    });
    const stats = {
        compilation: {
            assets: {
                'something.js': {},
                'somethingelse.js': {}
            },
            outputOptions: {
                publicPath: 'path'
            }
        }
    };
    compiler.plugin.mockImplementation((name, cb) => {
        return cb(stats);
    });
    uploadSourceMap.mockImplementation(() => {
        return () => {
            return new Promise(res => {
                res('url');
            });
        };
    });
    console.log = jest.fn();
    const promise = nr.apply(compiler);
    promise.then(() => {
        expect(console.log.mock.calls[0][0]).toMatch(/sourceMap for .* uploaded to newrelic/i);
    });
});

test('it logs the error for an error is thrown', () => {
    const nr = new NewRelicPlugin({
        applicationId: 'id',
        nrAdminKey: 'key',
        staticAssetUrl: 'url',
    });
    const stats = {
        compilation: {
            assets: {
                'something.js': {},
                'somethingelse.js': {}
            },
            outputOptions: {
                publicPath: 'path'
            }
        }
    };
    compiler.plugin.mockImplementation((name, cb) => {
        return cb(stats);
    });
    uploadSourceMap.mockImplementation(() => {
        return () => {
            return new Promise((res, rej) => {
                rej('error');
            });
        };
    });
    console.log = jest.fn();
    const promise = nr.apply(compiler);
    promise.catch(() => {
        expect(console.log).toBeCalledWith('error');
    });
});

