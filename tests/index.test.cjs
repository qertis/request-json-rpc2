const test = require('node:test');
const assert = require('node:assert/strict');
const requestJsonRpc2 = require('../dist/index.cjs').default;

test('CJS', async () => {
  assert.equal(typeof requestJsonRpc2, 'function');
});
