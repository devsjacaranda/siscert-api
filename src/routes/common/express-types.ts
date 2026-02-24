import { Request, Response } from 'express';
import { PlainObject } from 'jet-validators';

/******************************************************************************
                                Types
******************************************************************************/

type UrlParams = Record<string, string>;

export type Req = Request<UrlParams, void, PlainObject>;
export type Res = Response;

/** Request após middleware JWT; userId está definido. */
export interface AuthReq extends Req {
  userId: number;
}
