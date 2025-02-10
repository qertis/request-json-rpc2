type version = '2.0'

type signature = {
  readonly '@context': string[]
  readonly id: string
  readonly type: string
  readonly controller: string
  readonly expires: string
  readonly publicKeyBase58: string
}

export interface JSONRPCResponseBase {
  jsonrpc: version;
  id: string | null;
}

export interface JSONRPCSuccessResponse extends JSONRPCResponseBase {
  result: string;
  error: never;
}

export interface JSONRPCErrorResponse extends JSONRPCResponseBase {
  error: {
    code: number;
    message: string;
  };
  result: never;
}

export type JSONRPCResponse = JSONRPCSuccessResponse | JSONRPCErrorResponse;

type AuthParams = {
  user: string
  pass: string
}

type RequestParams<T> = T extends object ? T : string[]

export interface JSONRPCRequest {
  url: string
  body: {
    jsonrpc: version
    id: string
    method: string
    params: RequestParams<any>
  }
  headers?: Record<string, string>
  auth?: AuthParams
  credentials?: string
  signature?: signature
}

declare const _default: (request: JSONRPCRequest) => Promise<JSONRPCResponse>;

export default _default;

declare module 'request-json-rpc2' {
  export = _default;
}
