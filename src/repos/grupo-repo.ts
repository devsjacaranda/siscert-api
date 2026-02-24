import prisma from '@src/lib/prisma';

export interface GrupoApi {
  id: number;
  nome: string;
  createdAt: string;
}

export async function findMany(): Promise<GrupoApi[]> {
  const rows = await prisma.grupo.findMany({
    orderBy: [{ nome: 'asc' }],
  });
  return rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function findById(id: number): Promise<GrupoApi | null> {
  const row = await prisma.grupo.findUnique({
    where: { id },
  });
  return row
    ? { id: row.id, nome: row.nome, createdAt: row.createdAt.toISOString() }
    : null;
}

export async function create(nome: string): Promise<GrupoApi> {
  const row = await prisma.grupo.create({
    data: { nome },
  });
  return { id: row.id, nome: row.nome, createdAt: row.createdAt.toISOString() };
}

export async function update(id: number, nome: string): Promise<GrupoApi | null> {
  try {
    const row = await prisma.grupo.update({
      where: { id },
      data: { nome },
    });
    return { id: row.id, nome: row.nome, createdAt: row.createdAt.toISOString() };
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return null;
    throw e;
  }
}

export async function remove(id: number): Promise<boolean> {
  const result = await prisma.grupo.deleteMany({ where: { id } });
  return result.count > 0;
}

export interface UserInGrupo {
  userId: number;
  acesso: 'comum' | 'visualizador';
}

export async function getUsersInGrupo(grupoId: number): Promise<number[]> {
  const rows = await prisma.userGrupo.findMany({
    where: { grupoId },
    select: { userId: true },
  });
  return rows.map((r) => r.userId);
}

export async function getUsersInGrupoComAcesso(grupoId: number): Promise<UserInGrupo[]> {
  const rows = await prisma.userGrupo.findMany({
    where: { grupoId },
    select: { userId: true, acesso: true },
  });
  return rows.map((r) => ({
    userId: r.userId,
    acesso: (r.acesso === 'visualizador' ? 'visualizador' : 'comum') as 'comum' | 'visualizador',
  }));
}

export async function setUsersInGrupo(
  grupoId: number,
  usuarios: Array<{ userId: number; acesso?: 'comum' | 'visualizador' }>
): Promise<void> {
  await prisma.userGrupo.deleteMany({ where: { grupoId } });
  if (usuarios.length > 0) {
    await prisma.userGrupo.createMany({
      data: usuarios.map((u) => ({ userId: u.userId, grupoId, acesso: u.acesso ?? 'comum' })),
      skipDuplicates: true,
    });
  }
}

export async function getEmpresasByGrupoId(grupoId: number): Promise<number[]> {
  const rows = await prisma.grupoEmpresa.findMany({
    where: { grupoId },
    select: { empresaId: true },
  });
  return rows.map((r) => r.empresaId);
}

export async function setEmpresasInGrupo(grupoId: number, empresaIds: number[]): Promise<void> {
  await prisma.grupoEmpresa.deleteMany({ where: { grupoId } });
  if (empresaIds.length > 0) {
    await prisma.grupoEmpresa.createMany({
      data: empresaIds.map((empresaId) => ({ grupoId, empresaId })),
      skipDuplicates: true,
    });
  }
}

export default {
  findMany,
  findById,
  create,
  update,
  remove,
  getUsersInGrupo,
  getUsersInGrupoComAcesso,
  setUsersInGrupo,
  getEmpresasByGrupoId,
  setEmpresasInGrupo,
} as const;
