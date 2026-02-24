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
  role?: string;
  status?: string;
}): Promise<User> {
  const user = await prisma.user.create({
    data: {
      login: data.login,
      senhaHash: data.senhaHash,
      nome: data.nome ?? undefined,
      role: data.role ?? 'usuario',
      status: data.status ?? 'pendente',
    },
  });
  return user;
}

export async function findMany(): Promise<
  Array<Omit<User, 'senhaHash'> & { grupos: Array<{ grupoId: number }> }>
> {
  const rows = await prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      login: true,
      nome: true,
      role: true,
      status: true,
      approvedAt: true,
      approvedBy: true,
      createdAt: true,
      grupos: { select: { grupoId: true, acesso: true } },
    },
  });
  return rows as unknown as Array<Omit<User, 'senhaHash'> & { grupos: Array<{ grupoId: number; acesso: string }> }>;
}

export async function updateStatus(
  id: number,
  status: string,
  approvedBy?: number
): Promise<User | null> {
  try {
    const data: { status: string; approvedAt?: Date; approvedBy?: number } = { status };
    if (status === 'ativo') {
      data.approvedAt = new Date();
      if (approvedBy != null) data.approvedBy = approvedBy;
    }
    return prisma.user.update({
      where: { id },
      data,
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return null;
    throw e;
  }
}

export async function updateUser(
  id: number,
  data: { nome?: string | null; login?: string; senhaHash?: string }
): Promise<User | null> {
  try {
    const payload: Record<string, unknown> = {};
    if (data.nome !== undefined) payload.nome = data.nome;
    if (data.login != null) payload.login = data.login;
    if (data.senhaHash != null) payload.senhaHash = data.senhaHash;
    if (Object.keys(payload).length === 0) return findById(id);
    return prisma.user.update({
      where: { id },
      data: payload as Parameters<typeof prisma.user.update>[0]['data'],
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return null;
    throw e;
  }
}

export type UserGrupoComAcesso = { grupoId: number; acesso: 'comum' | 'visualizador' };

export async function getGruposByUserId(userId: number): Promise<number[]> {
  const rows = await prisma.userGrupo.findMany({
    where: { userId },
    select: { grupoId: true },
  });
  return rows.map((r) => r.grupoId);
}

export async function getUserGruposComAcesso(userId: number): Promise<UserGrupoComAcesso[]> {
  const rows = await prisma.userGrupo.findMany({
    where: { userId },
    select: { grupoId: true, acesso: true },
  });
  return rows.map((r) => ({
    grupoId: r.grupoId,
    acesso: (r.acesso === 'visualizador' ? 'visualizador' : 'comum') as 'comum' | 'visualizador',
  }));
}

export async function setUserGrupos(
  userId: number,
  grupos: Array<{ grupoId: number; acesso?: 'comum' | 'visualizador' }>
): Promise<void> {
  await prisma.userGrupo.deleteMany({ where: { userId } });
  if (grupos.length > 0) {
    await prisma.userGrupo.createMany({
      data: grupos.map((g) => ({ userId, grupoId: g.grupoId, acesso: g.acesso ?? 'comum' })),
      skipDuplicates: true,
    });
  }
}

export async function deleteUser(userId: number): Promise<boolean> {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return true;
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return false;
    throw e;
  }
}

export default {
  findById,
  findByLogin,
  create,
  updateSenha,
  findMany,
  updateStatus,
  updateUser,
  getGruposByUserId,
  getUserGruposComAcesso,
  setUserGrupos,
  deleteUser,
} as const;
