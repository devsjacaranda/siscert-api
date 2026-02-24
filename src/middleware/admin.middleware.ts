import { NextFunction, Request, Response } from 'express';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import AuthRepo from '@src/repos/AuthRepo';
import type { AuthReq } from '@src/routes/common/express-types';

/******************************************************************************
 * Middleware admin: requer JWT antes e verifica role === "admin".
 * Usar após jwtMiddleware.
 ******************************************************************************/

export async function adminMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthReq;
  const userId = authReq.userId;
  if (typeof userId !== 'number') {
    next(new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Não autenticado'));
    return;
  }
  const user = await AuthRepo.findById(userId);
  if (!user || user.role !== 'admin') {
    next(new RouteError(HttpStatusCodes.FORBIDDEN, 'Acesso restrito a administradores'));
    return;
  }
  next();
}
