import assert from 'node:assert';
import { test } from 'node:test';
import express from 'express';
import requestJsonRpc2 from '../index.mjs';

const app = express();
app.use(express.json());

test('MJS', async () => {
  app.post('/api', (req, res) => {
    switch (req.body.body.method) {
      case 'ping': {
        if (req.body.body.params.foo === 'bar') {
          res.status(200).json('PONG');
        }
        break;
      }
    }
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
    dev: true,
  }, app);
  assert.equal(result, 'PONG');
});
