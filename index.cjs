const isDev = String(process.env.NODE_ENV).toLowerCase() === 'test';

const request = require('request');
let supertest;
if (isDev) {
  supertest = require('supertest');
}

/**
 * @param {string} obj - obj
 * @param {string} obj.url - url
 * @param {object} obj.body - body
 * @param {object} [obj.auth] - basic auth
 * @param {string} [obj.verification] - verification signatures like Ed25519Signature2018
 * @param {object} [app] - ExpressJS app
 * @returns {Promise<*>}
 */
const rpc = ({ url, body, headers = {}, auth, jwt, verification }, app) => {
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
  if (verification) {
    parameters.headers['verification'] = verification;
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
        message: '"app" not found in second argument',
        statusCode: 500,
      });
    }
    return supertest(app)
      .post(url)
      .send({
        method: parameters.method,
        url: 'http://' + parameters.url,
        headers: parameters.headers,
        body,
      })
      .then((response) => {
        return response.body.result;
      });
  }
  return new Promise((resolve, reject) => {
    request(parameters, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (!body) {
        return reject({
          message: 'Unknown Error',
          statusCode: 500,
        });
      }
      if (response.statusCode >= 400) {
        return reject({
          message: body.error || body,
          statusCode: response.statusCode,
        });
      }
      return resolve(body);
    });
  });
};

module.exports = rpc;