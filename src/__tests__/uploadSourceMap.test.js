"use strict";
jest.mock('@newrelic/publish-sourcemap', () => {
    return {
        publishSourcemap: jest.fn((obj, cb) => {
            cb();
        })
    };
});
const {publishSourcemap} = require('@newrelic/publish-sourcemap');
const uploadSourceMap = require('../uploadSourceMap');
const assets = {
    'file.js': {
        children: ['#sourceMappingURL=file.js.map']
    },
    'file.js.map': {
        emitted: true,
        existsAt: 'some location'
    }
};

beforeEach(() => {
  jest.clearAllMocks();
});


test('it returns a function', () => {
    expect(uploadSourceMap({})).toEqual(expect.any(Function));
});

test('if the current asset doesnt have a map it immediately returns a promise', () => {
    const func = uploadSourceMap({'assets':{'file.js':{}}});
    expect(func('file.js')).toEqual(expect.any(Promise));
    expect(publishSourcemap).not.toBeCalled();
});

test('if it cannot find the source map in the assets it immediately returns a promise', () => {
    const func = uploadSourceMap({
        'assets': {
            'file.js': {
                children: ['#sourceMappingURL=file.js.map']
            }
        }
    });
    expect(func('file.js')).toEqual(expect.any(Promise));
    expect(publishSourcemap).not.toBeCalled();
});

test('if the source map is not emitted it immediately returns a promise', () => {
    const func = uploadSourceMap({
        assets: {
            'file.js': {
                children: ['#sourceMappingURL=file.js.map']
            },
            'file.js.map': {
                emitted: false
            }
        }
    });
    expect(func('file.js')).toEqual(expect.any(Promise));
    expect(publishSourcemap).not.toBeCalled();    
});

test('it calls staticAssetUrlBuilder with the url, publicpath, item, and stats object', () => {
    const stats = {statsStuff: {}};
    const staticAssetUrlBuilder = jest.fn();
    const func = uploadSourceMap({
        assets,
        staticAssetUrlBuilder,
        url: 'url',
        publicPath: 'publicpath',
        stats
    });
    func('file.js');
    expect(staticAssetUrlBuilder).toBeCalledWith('url', 'publicpath', 'file.js', stats);
});

test('it calls publishSourcemap with correct options', () => {
    const stats = {statsStuff: {}};
    const staticAssetUrlBuilder = jest.fn().mockReturnValue('a url that maps to a js file');
    const func = uploadSourceMap({
        assets,
        staticAssetUrlBuilder,
        stats,
        nrAdminKey: 'key',
        applicationId: 'id'
    });
    return func('file.js').then(() => {
        expect(publishSourcemap).toBeCalledWith({
            sourcemapPath: 'some location',
            javascriptUrl: 'a url that maps to a js file',
            applicationId: 'id',
            nrAdminKey: 'key'
        }, expect.any(Function));
    });
});

test('if publish fails it rejects the promise', () => {
    const stats = {statsStuff: {}};
    const staticAssetUrlBuilder = jest.fn().mockReturnValue('a url that maps to a js file');
    const func = uploadSourceMap({
        assets,
        staticAssetUrlBuilder,
        stats,
        nrAdminKey: 'key',
        applicationId: 'id'
    });
    const error = {message: 'its an error'}; 
    publishSourcemap.mockImplementation((obj, cb) => {
        cb(error);
    });
    return func('file.js').catch((err) => {
        expect(err).toEqual(error);
    });
});

test('if publish succeeds it resolves the promise with the js url', () => {
    const stats = {statsStuff: {}};
    const staticAssetUrlBuilder = jest.fn().mockReturnValue('a url that maps to a js file');
    const func = uploadSourceMap({
        assets,
        staticAssetUrlBuilder,
        stats,
        nrAdminKey: 'key',
        applicationId: 'id'
    });
    publishSourcemap.mockImplementation((obj, cb) => {
        cb();
    });
    return func('file.js').then((val) => {
        expect(val).toEqual('a url that maps to a js file');
    });
});


