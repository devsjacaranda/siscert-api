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
  role?: string;
  status?: string;
}

export interface CadastroResult {
  usuario: string;
  message: string;
}

export async function cadastrar(body: CadastroBody): Promise<CadastroResult> {
  const existente = await AuthRepo.findByLogin(body.login);
  if (existente) {
    throw new RouteError(HttpStatusCodes.CONFLICT, 'Login já em uso');
  }
  const senhaHash = await bcrypt.hash(body.senha, SALT_ROUNDS);
  const user = await AuthRepo.create({
    login: body.login,
    senhaHash,
    nome: body.nome,
    role: 'usuario',
    status: 'pendente',
  });
  return {
    usuario: user.login,
    message: 'Conta criada. Aguarde aprovação do administrador.',
  };
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
  if (user.status !== 'ativo') {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      user.status === 'pendente'
        ? 'Conta aguardando aprovação do administrador.'
        : 'Conta bloqueada.'
    );
  }
  const token = gerarToken(user.id, user.login);
  return {
    token,
    usuario: user.login,
    role: user.role,
    status: user.status,
  };
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
