const enforceExists = require('../enforceExists');

test('throws an error if the property is not on the object', () => {
    const testError = () => enforceExists({}, 'something');
    expect(testError).toThrowError('something is required');
});
test('returns the property from the object', () => {
    expect(enforceExists({somekey: 'somevalue'}, 'somekey')).toEqual('somevalue');
});
