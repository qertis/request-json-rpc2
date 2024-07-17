type version = '2.0'

export interface JSONRPCResponse {
  jsonrpc: version
  id: string | null
  result?: string
  error?: {
    code: number
    message: string
  }
}

export interface JSONRPCRequest {
  url: string
  body: {
    jsonrpc: version
    id: string
    method: string
    params: unknown
  }
  headers?: {
    Accept: string
    'Content-Type': string
  }
  auth?: {
    user: string
    pass: string
  }
  jwt?: string
  signature?: {
    '@context': string[]
    id: string
    type: string
    controller: string
    expires: string
    publicKeyBase58: string
  }
}

declare const _default: (request: JSONRPCRequest) => Promise<JSONRPCResponse>;

export default _default;

declare module 'request-json-rpc2' {
  export = _default;
}
