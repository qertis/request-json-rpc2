/**
 * @constant
 * @type {string}
 */
const VERSION = '2.0';
/**
 * @param {string} obj - object
 * @param {string} obj.url - url
 * @param {object} obj.body - body
 * @param {object} [obj.headers] - headers
 * @param {object} [obj.auth] - basic auth
 * @param {object} [obj.jwt] - jwt
 * @param {object} [obj.signature] - verification Ed25519 signatures
 * @param {boolean} [obj.dev] - development
 * @param {object} [app] - Express JS Application
 * @returns {Promise<object>}
 */
export default async({
               url,
               body,
               headers = {},
               auth,
               jwt,
               signature,
               dev = false,
             }, app) => {
  if ('production' !== process.env.NODE_ENV) {
    if (dev) {
      if (!app) {
        return Promise.reject({
          jsonrpc: VERSION,
          error: {code: -32603, message: '"app" not found in second argument'},
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
          error: {code: -32603, message: e.message},
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
  if (jwt) {
    fheaders.append('Authorization', 'Bearer ' + jwt);
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
  }).catch(({message}) => {
    switch (message) {
      case 'Not Found': {
        return {
          jsonrpc: VERSION,
          error: { code: -32603, message: message },
          id: null,
        }
      }
      default: {
        return {
          jsonrpc: VERSION,
          error: { code: -32099, message: message },
          id: null,
        }
      }
    }
  });
};
