import { NextFunction, Request, Response } from 'express';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import AuthRepo from '@src/repos/AuthRepo';
import type { AuthReq } from '@src/routes/common/express-types';

export type UserGrupoAcesso = { grupoId: number; acesso: 'comum' | 'visualizador' };

export interface AuthContextReq extends AuthReq {
  userRole: string;
  userGrupoIds: number[];
  userGrupos: UserGrupoAcesso[];
}

/******************************************************************************
 * Middleware: após JWT, busca role e grupos do usuário.
 * Usado em rotas que precisam filtrar por grupo (ex: certidões).
 ******************************************************************************/

export async function authContextMiddleware(
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
  if (!user) {
    next(new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Usuário não encontrado'));
    return;
  }
  const userGrupos = await AuthRepo.getUserGruposComAcesso(userId);
  const grupoIds = userGrupos.map((g) => g.grupoId);
  (req as AuthContextReq).userRole = user.role;
  (req as AuthContextReq).userGrupoIds = grupoIds;
  (req as AuthContextReq).userGrupos = userGrupos;
  next();
}
