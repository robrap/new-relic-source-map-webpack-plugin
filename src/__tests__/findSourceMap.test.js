"use strict";
const findSourceMap = require('../findSourceMap');

test('when children does not contain a source map it returns an empty string', () => {
    expect(findSourceMap(['blah', 'blah blah', 'more random stuff', 'hurray'])).toEqual('');
});
test('it ignores objects in the array', () => {
    expect(findSourceMap(['blah', 'blah blah', 'more random stuff', {}])).toEqual('');
});
test('it returns the name of the source map', () => {
    expect(findSourceMap([
        'blah',
        'blah blah',
        'more random stuff',
        {},
        'stuff at the beginning to be #sourceMappingURL=afilename.js.map'
    ])).toEqual('afilename.js.map');
});
test('it returns the last source map found', () => {
    expect(findSourceMap([
        'blah',
        'blah blah',
        'more random stuff',
        {},
        'stuff at the beginning to be #sourceMappingURL=afilename.js.map',
        'somehow this chunk has two and we take that last one when ambiguous #sourceMappingURL=differentfilename.js.map'
    ])).toEqual('differentfilename.js.map');
});
