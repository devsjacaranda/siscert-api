import prisma from '@src/lib/prisma';

export interface TipoCertidaoApi {
  id: number;
  nome: string;
  ordem: number;
  ativo: boolean;
}

export async function findMany(apenasAtivos = false): Promise<TipoCertidaoApi[]> {
  const where = apenasAtivos ? { ativo: true } : {};
  const rows = await prisma.tipoCertidao.findMany({
    where,
    orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
  });
  return rows.map((r) => ({ id: r.id, nome: r.nome, ordem: r.ordem, ativo: r.ativo }));
}

export async function findById(id: number): Promise<TipoCertidaoApi | null> {
  const row = await prisma.tipoCertidao.findUnique({
    where: { id },
  });
  return row ? { id: row.id, nome: row.nome, ordem: row.ordem, ativo: row.ativo } : null;
}

export async function create(data: { nome: string; ordem?: number }): Promise<TipoCertidaoApi> {
  const row = await prisma.tipoCertidao.create({
    data: { nome: data.nome, ordem: data.ordem ?? 0, ativo: true },
  });
  return { id: row.id, nome: row.nome, ordem: row.ordem, ativo: row.ativo };
}

export async function update(
  id: number,
  data: { nome?: string; ordem?: number; ativo?: boolean }
): Promise<TipoCertidaoApi | null> {
  try {
    const row = await prisma.tipoCertidao.update({
      where: { id },
      data: {
        ...(data.nome != null && { nome: data.nome }),
        ...(data.ordem != null && { ordem: data.ordem }),
        ...(data.ativo != null && { ativo: data.ativo }),
      },
    });
    return { id: row.id, nome: row.nome, ordem: row.ordem, ativo: row.ativo };
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return null;
    throw e;
  }
}

export async function remove(id: number): Promise<boolean> {
  const result = await prisma.tipoCertidao.deleteMany({ where: { id } });
  return result.count > 0;
}

export default {
  findMany,
  findById,
  create,
  update,
  remove,
} as const;
