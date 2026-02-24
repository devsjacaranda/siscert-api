import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars from '@src/common/constants/env';
import { RouteError } from '@src/common/utils/route-errors';
import type { AuthReq } from '@src/routes/common/express-types';

const BEARER_PREFIX = 'Bearer ';

/******************************************************************************
 * Middleware JWT: lê Authorization Bearer, valida token e define req.userId.
 * Rotas que usam este middleware devem tipar req como AuthReq.
 ******************************************************************************/

export function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Token não informado'));
    return;
  }
  const token = header.slice(BEARER_PREFIX.length);
  try {
    const payload = jwt.verify(token, EnvVars.JwtSecret) as unknown as { sub: number };
    if (typeof payload.sub !== 'number') {
      next(new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Token inválido'));
      return;
    }
    (req as AuthReq).userId = payload.sub;
    next();
  } catch {
    next(new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Token inválido ou expirado'));
  }
}
