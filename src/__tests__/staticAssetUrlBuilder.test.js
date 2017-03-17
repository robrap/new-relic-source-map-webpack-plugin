const staticAssetUrlBuilder = require('../staticAssetUrlBuilder');

test('combines the url, publicPath, and filename', () => {
    expect(staticAssetUrlBuilder('http://1stdibs.com',
        '/where/the/asset/lives',
        'bestBundle.js')).toEqual('http://1stdibs.com/where/the/asset/lives/bestBundle.js');
});

test('it removes trailing slashes from publicPath and url if present', () => {
   expect(staticAssetUrlBuilder('http://1stdibs.com/',
        '/where/the/asset/lives/',
        'bestBundle.js')).toEqual('http://1stdibs.com/where/the/asset/lives/bestBundle.js'); 
})
