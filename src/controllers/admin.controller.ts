import { ZodError } from 'zod';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import AdminService from '@src/services/admin.service';
import AuthService from '@src/services/AuthService';
import type { AuthReq } from '@src/routes/common/express-types';
import {
  usuarioCreateSchema,
  usuarioUpdateSchema,
  usuarioGruposSchema,
  grupoCreateSchema,
  grupoUpdateSchema,
  grupoUsuariosSchema,
  grupoEmpresasSchema,
  tipoCertidaoCreateSchema,
  tipoCertidaoUpdateSchema,
  empresaCreateSchema,
  empresaUpdateSchema,
  empresaTiposBloqueadosSchema,
} from '@src/models/admin.model';
import type { NextFunction, Request, Response } from 'express';

type Req = Request;
type Res = Response;
type Next = NextFunction;

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

function getIdParam(req: Req): number {
  const raw = req.params['id'];
  const str = Array.isArray(raw) ? raw[0] : raw;
  const id = typeof str === 'string' ? parseInt(str, 10) : NaN;
  if (Number.isNaN(id) || id < 1) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'ID inválido');
  }
  return id;
}

export async function getAdminStats(_req: Req, res: Res, next: Next): Promise<void> {
  try {
    const stats = await AdminService.getAdminStats();
    res.status(HttpStatusCodes.OK).json(stats);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function listarUsuarios(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const usuarios = await AdminService.listarUsuarios();
    res.status(HttpStatusCodes.OK).json(usuarios);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function aprovarUsuario(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const authReq = req as AuthReq;
    const usuario = await AdminService.aprovarUsuario(id, authReq.userId);
    if (!usuario) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(usuario);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function bloquearUsuario(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const authReq = req as AuthReq;
    const usuario = await AdminService.bloquearUsuario(id, authReq.userId);
    if (!usuario) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(usuario);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function criarUsuario(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const body = parseBody((b: unknown) => usuarioCreateSchema.parse(b), req.body);
    const authReq = req as AuthReq;
    const usuario = await AdminService.criarUsuario(body, authReq.userId);
    res.status(HttpStatusCodes.CREATED).json(usuario);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function atualizarUsuario(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const body = parseBody((b: unknown) => usuarioUpdateSchema.parse(b), req.body);
    const authReq = req as AuthReq;
    const usuario = await AdminService.atualizarUsuario(id, body, authReq.userId);
    if (!usuario) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(usuario);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function setUsuarioGrupos(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const body = parseBody((b: unknown) => usuarioGruposSchema.parse(b), req.body);
    const authReq = req as AuthReq;
    await AdminService.setUsuarioGrupos(id, body.grupos, authReq.userId);
    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function reativarUsuario(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const authReq = req as AuthReq;
    const usuario = await AdminService.reativarUsuario(id, authReq.userId);
    if (!usuario) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(usuario);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function excluirUsuario(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const authReq = req as AuthReq;
    const ok = await AdminService.excluirUsuario(id, authReq.userId);
    if (!ok) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function entrarComoUsuario(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const result = await AuthService.loginAs(id);
    res.status(HttpStatusCodes.OK).json(result);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function listarGrupos(_req: Req, res: Res, next: Next): Promise<void> {
  try {
    const grupos = await AdminService.listarGrupos();
    res.status(HttpStatusCodes.OK).json(grupos);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function criarGrupo(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const body = parseBody((b: unknown) => grupoCreateSchema.parse(b), req.body);
    const grupo = await AdminService.criarGrupo(body);
    res.status(HttpStatusCodes.CREATED).json(grupo);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function atualizarGrupo(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const body = parseBody((b: unknown) => grupoUpdateSchema.parse(b), req.body);
    const grupo = await AdminService.atualizarGrupo(id, body);
    if (!grupo) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Grupo não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(grupo);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function getGrupoById(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const grupo = await AdminService.getGrupoById(id);
    if (!grupo) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Grupo não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(grupo);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function setGrupoEmpresas(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const body = parseBody((b: unknown) => grupoEmpresasSchema.parse(b), req.body);
    await AdminService.setGrupoEmpresas(id, body);
    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function excluirGrupo(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const ok = await AdminService.excluirGrupo(id);
    if (!ok) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Grupo não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function setGrupoUsuarios(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const body = parseBody((b: unknown) => grupoUsuariosSchema.parse(b), req.body);
    await AdminService.setGrupoUsuarios(id, body);
    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function listarTiposCertidao(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const apenasAtivos = req.query.ativos === 'true';
    const tipos = await AdminService.listarTiposCertidao(apenasAtivos);
    res.status(HttpStatusCodes.OK).json(tipos);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function criarTipoCertidao(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const body = parseBody((b: unknown) => tipoCertidaoCreateSchema.parse(b), req.body);
    const tipo = await AdminService.criarTipoCertidao(body);
    res.status(HttpStatusCodes.CREATED).json(tipo);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function atualizarTipoCertidao(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const body = parseBody((b: unknown) => tipoCertidaoUpdateSchema.parse(b), req.body);
    const tipo = await AdminService.atualizarTipoCertidao(id, body);
    if (!tipo) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Tipo não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(tipo);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function excluirTipoCertidao(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const ok = await AdminService.excluirTipoCertidao(id);
    if (!ok) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Tipo não encontrado' });
      return;
    }
    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function getEmpresaById(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const empresa = await AdminService.getEmpresaById(id);
    if (!empresa) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Empresa não encontrada' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(empresa);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function setEmpresaTiposBloqueados(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const body = parseBody((b: unknown) => empresaTiposBloqueadosSchema.parse(b), req.body);
    await AdminService.setEmpresaTiposBloqueados(id, body.tipoIds);
    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function listarEmpresas(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const apenasAtivos = req.query.ativos === 'true';
    const empresas = await AdminService.listarEmpresas(apenasAtivos);
    res.status(HttpStatusCodes.OK).json(empresas);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function criarEmpresa(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const body = parseBody((b: unknown) => empresaCreateSchema.parse(b), req.body);
    const empresa = await AdminService.criarEmpresa(body);
    res.status(HttpStatusCodes.CREATED).json(empresa);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function atualizarEmpresa(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const body = parseBody((b: unknown) => empresaUpdateSchema.parse(b), req.body);
    const empresa = await AdminService.atualizarEmpresa(id, body);
    if (!empresa) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Empresa não encontrada' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(empresa);
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function excluirEmpresa(req: Req, res: Res, next: Next): Promise<void> {
  try {
    const id = getIdParam(req);
    const ok = await AdminService.excluirEmpresa(id);
    if (!ok) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Empresa não encontrada' });
      return;
    }
    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (e) {
    if (e instanceof RouteError) {
      res.status(Number(e.status)).json({ error: e.message });
      return;
    }
    next(e);
  }
}
