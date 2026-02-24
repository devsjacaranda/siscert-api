import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import AuthRepo from '@src/repos/AuthRepo';
import GrupoRepo from '@src/repos/grupo-repo';
import type { AuthContextReq } from '@src/middleware/auth-context.middleware';
import type { NextFunction, Request, Response } from 'express';

/** GET /grupos - lista grupos (admin: todos; usuário: só os que pertence). */
export async function listar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthContextReq;
    const isAdmin = authReq.userRole === 'admin';
    let grupos;
    if (isAdmin) {
      grupos = await GrupoRepo.findMany();
    } else {
      const grupoIds = authReq.userGrupoIds ?? [];
      const todos = await GrupoRepo.findMany();
      grupos = todos.filter((g) => grupoIds.includes(g.id));
    }
    res.status(HttpStatusCodes.OK).json(grupos);
  } catch (e) {
    next(e);
  }
}
