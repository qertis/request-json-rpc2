/**
 * @param {object} obj - object
 * @param {string} obj.url - url
 * @param {object} obj.body - body
 * @param {object} [obj.headers] - headers
 * @param {object} [obj.auth] - basic auth
 * @param {object} [obj.signature] - verification Ed25519 signatures
 * @param {string} [obj.credentials] - credentials
 * @param {boolean} [obj.dev] - development
 * @param {object} [app] - Express JS Application
 * @returns {Promise<object>}
 */
export default async({
  url,
  body,
  headers = {},
  auth,
  signature,
  dev = false,
  credentials = 'omit',
}, app) => {
  /**
  * @constant
  * @type {string}
  */
  const VERSION = '2.0';
  /**
   * @constant
   * @type {number}
   */
  const INTERNAL_ERROR = -32603;
  /**
   * @constant
   * @type {number}
   */
  const GENERAL_ERROR = -32099;
  /**
   * @constant
   * @type {number}
   */
  const SIGNAL_TIMEOUT = 30000;
  if ('production' !== process.env.NODE_ENV) {
    if (dev) {
      if (!app) {
        return Promise.reject({
          jsonrpc: VERSION,
          error: {code: INTERNAL_ERROR, message: '"app" not found in second argument'},
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
      if (auth) {
        parameters.auth = auth;
      }
      const request = await import('supertest');
      const {post} = request.default(app);
      return post(url)
        .send({
          method: parameters.method,
          url: parameters.url,
          headers: parameters.headers,
          body,
        })
        .then(response => response.body)
        .catch(e => ({
          jsonrpc: VERSION,
          error: {code: INTERNAL_ERROR, message: e.message},
          id: null,
        }))
    }
  }

  const fheaders = new Headers();
  Object.keys(headers).forEach(((key) => {
    fheaders.append(key, headers[key]);
  }));
  if (!fheaders.has('Accept')) {
    fheaders.append('Accept', 'application/json');
  }
  if (!fheaders.has('Content-Type')) {
    fheaders.append('Content-Type', 'application/json');
  }
  if (signature) {
    fheaders.append('Signature', JSON.stringify(signature));
  }
  if (auth && auth.user && auth.pass) {
    const basicAuth = 'Basic ' +
      Buffer.from(auth.user + ':' + auth.pass).toString('base64');
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
    credentials,
    signal: AbortSignal.timeout(SIGNAL_TIMEOUT),
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
  }).catch(({message}) => {
    switch (message) {
      case 'Not Found': {
        return {
          jsonrpc: VERSION,
          error: { code: INTERNAL_ERROR, message: message },
          id: null,
        };
      }
      default: {
        return {
          jsonrpc: VERSION,
          error: { code: GENERAL_ERROR, message: message },
          id: null,
        };
      }
    }
  });
};
