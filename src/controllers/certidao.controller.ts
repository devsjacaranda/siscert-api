import { ZodError } from 'zod';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  parseCertidaoCreateBody,
  parseCertidaoUpdateBody,
} from '@src/models/certidao.model';
import CertidaoService from '@src/services/certidao.service';
import type { StatusCertidaoVida } from '@src/repos/certidao-repo';
import type { NextFunction, Request, Response } from 'express';
import type { AuthContextReq } from '@src/middleware/auth-context.middleware';

type Req = Request;
type Res = Response;
type Next = NextFunction;

function getAuthContext(req: Req): {
  isAdmin: boolean;
  grupoIds: number[];
  grupoAcesso: Record<number, 'comum' | 'visualizador'>;
} {
  const authReq = req as AuthContextReq;
  const userGrupos = authReq.userGrupos ?? [];
  const grupoAcesso: Record<number, 'comum' | 'visualizador'> = {};
  userGrupos.forEach((g) => {
    grupoAcesso[g.grupoId] = g.acesso;
  });
  return {
    isAdmin: authReq.userRole === 'admin',
    grupoIds: authReq.userGrupoIds ?? [],
    grupoAcesso,
  };
}

function parseBody<T>(parse: (body: unknown) => T, body: unknown): T {
  try {
    return parse(body);
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Dados inválidos';
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, msg);
    }
    throw e;
  }
}

/******************************************************************************
 * Controller: HTTP logic + status codes + try/catch. Delega regras ao service.
 ******************************************************************************/

export async function listar(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const filtro: { status?: StatusCertidaoVida } | undefined =
      status === 'ativa' || status === 'arquivada' || status === 'lixeira'
        ? { status: status as StatusCertidaoVida }
        : undefined;
    const ctx = getAuthContext(req);
    const certidoes = await CertidaoService.listar(filtro, ctx);
    res.status(HttpStatusCodes.OK).json(certidoes);
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function obter(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = req.params.id as string;
    const ctx = getAuthContext(req);
    const certidao = await CertidaoService.obter(id, ctx);
    res.status(HttpStatusCodes.OK).json(certidao);
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function criar(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const body = parseBody(parseCertidaoCreateBody, req.body);
    const ctx = getAuthContext(req);
    const certidao = await CertidaoService.criar(body, ctx);
    res.status(HttpStatusCodes.CREATED).json(certidao);
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function atualizar(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = req.params.id as string;
    const body = parseBody(parseCertidaoUpdateBody, req.body);
    const ctx = getAuthContext(req);
    const certidao = await CertidaoService.atualizar(id, body, ctx);
    res.status(HttpStatusCodes.OK).json(certidao);
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function excluir(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = req.params.id as string;
    const ctx = getAuthContext(req);
    await CertidaoService.excluir(id, ctx);
    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function arquivar(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = req.params.id as string;
    const ctx = getAuthContext(req);
    const certidao = await CertidaoService.arquivar(id, ctx);
    res.status(HttpStatusCodes.OK).json(certidao);
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function restaurar(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = req.params.id as string;
    const ctx = getAuthContext(req);
    const certidao = await CertidaoService.restaurar(id, ctx);
    res.status(HttpStatusCodes.OK).json(certidao);
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function duplicar(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = req.params.id as string;
    const ctx = getAuthContext(req);
    const certidao = await CertidaoService.duplicar(id, ctx);
    res.status(HttpStatusCodes.CREATED).json(certidao);
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
}
