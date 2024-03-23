# Request JSON-RPC 2 - Simplified JSON-RPC 2.0 NodeJS client

## Super simple to use

Request JSON-RPC 2 is designed to be the simplest way possible to make JSON-RPC 2 calls.

```javascript
const requestJsonRpc2 = require('request-json-rpc2');

const result = await requestJsonRpc2({
  url: String,
  body: {
    method: String,
    params: Array | Object,
  },
});
```

## Powerful sample

```javascript
const result = await requestJsonRpc2({
  url: '/api',
  body: {
    id: '1234567890',
    method: 'record',
    params: {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "$id": "https://example.com/employee.schema.json",
      "title": "Record of employee",
      "description": "This document records the details of an employee",
      "type": "object",
      "properties": {
        "id": {
          "description": "A unique identifier for an employee",
          "type": "number",
        },
      },
    },
  },
  headers: {
    'Accept': 'application/schema+json',
  },
});
```

## HTTP Authentication

Includes basic or bearer.

```javascript
const result = await requestJsonRpc2({
  url: '/api',
  body: {
    method: 'YOUR_METHOD',
    params: ['auth hello world'],
  }, 
  auth: {
    'user': 'username',
    'pass': 'password',
    'sendImmediately': false,
  },
});
```

## JWT

JSON Web Token example.

```javascript
const result = await requestJsonRpc2({
  url: '/api',
  body: {
    method: 'YOUR_METHOD',
    params: ['JWT hello world'],
  }, 
  jwt: 'ewogICJhbGciOiAiSFMyNTYiLAogICJ0eXAiOiAiSldUIgp9.ewogICJuYW1lIjogIlJlcXVlc3QgSlNPTi1SUEMgMi4wIgp9',
});
```

## Signature

> Ed25519Signature2018

```javascript
const result = await requestJsonRpc2({
  url: '/api',
  body: {
    method: 1,
    params: ['signature hello world'],
  },
  signature: {
    "@context": ["https://w3id.org/security/v2"],
    "id": "did:example:123456789abcdefghi#keys-1",
    "type": "Ed25519VerificationKey2018",
    "controller": "did:example:123456789abcdefghi",
    "expires": "2023-01-08T16:02:20Z",
    "publicKeyBase58": "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV",
  },
});
```

## Testing
See [tests directory](https://github.com/qertis/request-json-rpc2/tree/master/tests).
