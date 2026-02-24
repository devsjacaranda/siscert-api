import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars from '@src/common/constants/env';
import { RouteError } from '@src/common/utils/route-errors';
import AuthRepo from '@src/repos/AuthRepo';
import type { CadastroBody, LoginBody, TrocarSenhaBody } from '@src/models/auth.model';

const SALT_ROUNDS = 10;

/******************************************************************************
 * Regras de negócio de autenticação: hash, comparação, JWT, cadastro e login.
 ******************************************************************************/

export interface LoginResult {
  token: string;
  usuario: string;
}

export async function cadastrar(body: CadastroBody): Promise<LoginResult> {
  const existente = await AuthRepo.findByLogin(body.login);
  if (existente) {
    throw new RouteError(HttpStatusCodes.CONFLICT, 'Login já em uso');
  }
  const senhaHash = await bcrypt.hash(body.senha, SALT_ROUNDS);
  const user = await AuthRepo.create({
    login: body.login,
    senhaHash,
    nome: body.nome,
  });
  const token = gerarToken(user.id, user.login);
  return { token, usuario: user.login };
}

export async function login(body: LoginBody): Promise<LoginResult> {
  const user = await AuthRepo.findByLogin(body.login);
  if (!user) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Login ou senha inválidos');
  }
  const senhaOk = await bcrypt.compare(body.senha, user.senhaHash);
  if (!senhaOk) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Login ou senha inválidos');
  }
  const token = gerarToken(user.id, user.login);
  return { token, usuario: user.login };
}

function gerarToken(userId: number, login: string): string {
  return jwt.sign(
    { sub: userId, login },
    EnvVars.JwtSecret,
    { expiresIn: '7d' }
  );
}

export async function trocarSenha(
  userId: number,
  body: TrocarSenhaBody
): Promise<void> {
  const user = await AuthRepo.findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Usuário não encontrado');
  }
  const senhaAtualOk = await bcrypt.compare(body.senhaAtual, user.senhaHash);
  if (!senhaAtualOk) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Senha atual incorreta');
  }
  const senhaHash = await bcrypt.hash(body.senhaNova, SALT_ROUNDS);
  await AuthRepo.updateSenha(userId, senhaHash);
}

export default {
  cadastrar,
  login,
  trocarSenha,
} as const;
