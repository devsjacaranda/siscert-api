import type { User } from '../../generated/prisma/client';
import prisma from '@src/lib/prisma';

/******************************************************************************
 * Repositório de usuários para auth (tabela User via Prisma).
 ******************************************************************************/

export async function findById(id: number): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
}

export async function findByLogin(login: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { login },
  });
  return user;
}

export async function updateSenha(userId: number, senhaHash: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { senhaHash },
  });
}

export async function create(data: {
  login: string;
  senhaHash: string;
  nome?: string | null;
}): Promise<User> {
  const user = await prisma.user.create({
    data: {
      login: data.login,
      senhaHash: data.senhaHash,
      nome: data.nome ?? undefined,
    },
  });
  return user;
}

export default {
  findById,
  findByLogin,
  create,
  updateSenha,
} as const;
