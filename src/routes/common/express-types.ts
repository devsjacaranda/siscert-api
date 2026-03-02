import { Request, RequestHandler, Response } from 'express';

/******************************************************************************
                                Types
******************************************************************************/

type UrlParams = Record<string, string>;
type PlainObject = Record<string, unknown>;

export type Req = Request<UrlParams, void, PlainObject>;
export type Res = Response;

/** Request após middleware JWT; userId está definido. */
export interface AuthReq extends Req {
  userId: number;
}

/** Helper para tipar handlers que recebem AuthReq após jwtMiddleware. */
export function asAuthHandler(
  handler: (req: AuthReq, res: Res) => void | Promise<void>
): RequestHandler {
  return handler as unknown as RequestHandler;
}
