import { ZodError } from 'zod';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { parseCadastroBody, parseLoginBody, parseTrocarSenhaBody } from '@src/models/auth.model';
import AuthService from '@src/services/AuthService';
import { AuthReq, Req, Res } from './common/express-types';

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
 * Rotas de auth: cadastro e login. Valida body com Zod no início.
 ******************************************************************************/

/**
 * POST /api/auth/cadastro
 * Body: { login, senha, nome? }
 */
async function cadastro(req: Req, res: Res): Promise<void> {
  const body = parseBody(parseCadastroBody, req.body);
  const result = await AuthService.cadastrar(body);
  res.status(HttpStatusCodes.CREATED).json(result);
}

/**
 * POST /api/auth/login
 * Body: { login, senha }
 */
async function login(req: Req, res: Res): Promise<void> {
  const body = parseBody(parseLoginBody, req.body);
  const result = await AuthService.login(body);
  res.status(HttpStatusCodes.OK).json(result);
}

/**
 * POST /api/auth/trocar-senha
 * Requer JWT. Body: { senhaAtual, senhaNova }
 */
async function trocarSenha(req: AuthReq, res: Res): Promise<void> {
  const userId = req.userId;
  const body = parseBody(parseTrocarSenhaBody, req.body);
  await AuthService.trocarSenha(userId, body);
  res.status(HttpStatusCodes.OK).json({ ok: true });
}

export default {
  cadastro,
  login,
  trocarSenha,
} as const;
