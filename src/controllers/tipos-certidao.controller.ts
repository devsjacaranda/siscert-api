import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import TipoCertidaoRepo from '@src/repos/tipo-certidao-repo';
import type { NextFunction, Request, Response } from 'express';

/** GET /tipos-certidao - listagem pública (apenas tipos ativos). */
export async function listar(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tipos = await TipoCertidaoRepo.findMany(true);
    res.status(HttpStatusCodes.OK).json(tipos);
  } catch (e) {
    next(e);
  }
}
