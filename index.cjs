/**
 * @constant
 * @type {string}
 */
const VERSION = '2.0';
/**
 * @param {string} obj - obj
 * @param {string} obj.url - url
 * @param {object} obj.body - body
 * @param {object} [obj.auth] - basic auth
 * @param {string} [obj.signature] - verification Ed25519 signatures
 * @param {boolean} [obj.dev] - development
 * @param {object} [app] - Express JS Application
 * @returns {Promise<*>}
 */
const rpc = ({ url, body, headers = {}, auth, jwt, signature, dev = false, }, app) => {
  if (dev) {
    if (!app) {
      return Promise.reject({
        jsonrpc: VERSION,
        error: { code: -32603, message: '"app" not found in second argument' },
        id: null,
      });
    }
    const parameters = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...headers,
      },
      body: {
          jsonrpc: VERSION,
          ...body,
      },
      json: true,
    };
    if (signature) {
      parameters.headers['Signature'] = JSON.stringify(signature);
    }
    if (jwt) {
      parameters.headers['Authorization'] = 'Bearer ' + jwt;
    }
    if (auth) {
      parameters.auth = auth;
    }
    return new Promise((resolve, reject) => {
      require('supertest')(app)
      .post(url)
      .send({
        method: parameters.method,
        url: parameters.url,
        headers: parameters.headers,
        body,
      })
      .then((response) => {
        resolve(response.body);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  const fheaders = new Headers()
  fheaders.append('Accept', 'application/json');
  fheaders.append('Content-Type', 'application/json');
  if (signature) {
    fheaders.append('Signature', JSON.stringify(signature));
  }
  if (jwt) {
    fheaders.append('Authorization', 'Bearer ' + jwt);
  }
  if (auth && auth.user && auth.pass) {
    const basicAuth = 'Basic ' +
      Buffer.from(
        auth.user +
          ':' +
          auth.pass,
      ).toString('base64');
    fheaders.set('Authorization', basicAuth);
  }
  const parameters = {
    jsonrpc: VERSION,
    method: body.method,
  }
  if (body.id) {
    parameters.id = body.id;
  }
  if (body.params && typeof body.params !== 'object') {
    return {
      jsonrpc: VERSION,
      error: { code: -32602, message: 'Invalid params' },
      id: null,
    };
  }
  if (body.params) {
    parameters.params = body.params;
  }
  return fetch(url, {
    body: JSON.stringify(parameters),
    headers: fheaders,
    method: 'POST',
    signal: AbortSignal.timeout(30000),
  }).then(response => {
    if (response.status >= 400) {
      throw new Error(response.statusText)
    }
    return response.json();
  }).then(body => {
    if (body.name === 'InternalServerError') {
      return {
        jsonrpc: VERSION,
        error: { code: body.code, message: body.message },
        id: null,
      };
    }
    return body;
  }).catch(error => {
    switch (error.message) {
      case 'Not Found': {
        return {
          jsonrpc: VERSION,
          error: { code: -32603, message: error.message },
          id: null,
        }
      }
      default: {
        return {
          jsonrpc: VERSION,
          error: { code: -32099, message: error.message },
          id: null,
        }
      }
    }
  });
};

module.exports = rpc;
