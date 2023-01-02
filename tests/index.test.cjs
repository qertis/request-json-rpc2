const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const requestJsonRpc2 = require('../index.cjs');

const app = express();
app.use(express.json());

test('ExpressJS', async () => {
  app.post('/api', function(req, res) {
    res.status(200).json('PONG');
  });

  const result = await requestJsonRpc2({
    url: '/api',
    body: {
      id: '91135888-8aab-11ed-87f1-4fdf7c5ebb6e',
      method: 'ping',
      params: {
        foo: 'bar',
      },
    },
    headers: {
      'Accept': 'application/schema+json',
    },
  }, app);

  assert.equal(result, 'PONG');
});
