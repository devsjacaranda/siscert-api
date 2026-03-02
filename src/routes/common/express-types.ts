import { NextFunction, Request, Response } from 'express';

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

/** Wrapper para handlers que exigem AuthReq; use após jwtMiddleware. */
export function asAuthHandler(
  handler: (req: AuthReq, res: Res) => void | Promise<void>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    Promise.resolve(handler(req as AuthReq, res)).catch(next);
  };
}
