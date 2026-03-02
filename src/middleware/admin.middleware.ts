import { NextFunction, Request, Response } from 'express';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import AuthRepo from '@src/repos/AuthRepo';
import type { AuthReq } from '@src/routes/common/express-types';

/******************************************************************************
 * Middleware admin: requer JWT antes e verifica role === "admin" ou "superadmin".
 * Painel admin: superadmin (principal) e admin (gerenciável pelo superadmin).
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
  const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';
  if (!user || !isAdminOrSuper) {
    next(new RouteError(HttpStatusCodes.FORBIDDEN, 'Acesso restrito a administradores'));
    return;
  }
  next();
}
