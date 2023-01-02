const isDev = String(process.env.NODE_ENV).toLowerCase() === 'test';

const request = require('request');
const supertest = isDev ? require('supertest') : null;

/**
 * @param {string} obj - obj
 * @param {string} obj.url - url
 * @param {object} obj.body - body
 * @param {object} [obj.auth] - basic auth
 * @param {string} [obj.signature] - verification signatures like Ed25519
 * @param {object} [app] - ExpressJS app
 * @returns {Promise<*>}
 */
const rpc = ({ url, body, headers = {}, auth, jwt, signature }, app) => {
  const parameters = {
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
    body: {
        jsonrpc: '2.0',
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
  if (isDev) {
    if (!app) {
      return Promise.reject({
        jsonrpc: parameters.body.jsonrpc,
        error: { code: -32603, message: '"app" not found in second argument' },
        id: null,
      });
    }
    return new Promise((resolve, reject) => {
      supertest(app)
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
  return new Promise((resolve, reject) => {
    request(parameters, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (!body) {
        return reject({
          jsonrpc: parameters.body.jsonrpc,
          error: { code: -32099, message: 'Unknown Error' },
          id: null,
        });
      }
      if (response.statusCode >= 400) {
        return reject({
          jsonrpc: parameters.body.jsonrpc,
          error: { code: -32603, message: body.error || body },
          id: null,
        });
      }
      return resolve(body);
    });
  });
};

module.exports = rpc;