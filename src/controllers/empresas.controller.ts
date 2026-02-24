import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EmpresaRepo from '@src/repos/empresa-repo';
import type { AuthContextReq } from '@src/middleware/auth-context.middleware';
import type { NextFunction, Request, Response } from 'express';

/** GET /empresas - empresas visíveis ao usuário (JWT obrigatório). Admin ou sem grupos: todas; com grupos: união das empresas dos grupos. */
export async function listar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthContextReq;
    const apenasAtivos = req.query.ativos !== 'false';
    const isAdmin = authReq.userRole === 'admin';
    const grupoIds = authReq.userGrupoIds;
    const empresas = await EmpresaRepo.findManyForUser(apenasAtivos, grupoIds, isAdmin);
    res.status(HttpStatusCodes.OK).json(empresas);
  } catch (e) {
    next(e);
  }
}
