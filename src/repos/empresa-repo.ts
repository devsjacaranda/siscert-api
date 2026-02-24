import prisma from '@src/lib/prisma';

export interface EmpresaRow {
  id: number;
  slug: string;
  nome: string;
  cor: string | null;
  ordem: number;
  ativo: boolean;
}

export async function findMany(apenasAtivos = false): Promise<EmpresaRow[]> {
  const rows = await prisma.empresa.findMany({
    where: apenasAtivos ? { ativo: true } : undefined,
    orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
  });
  return rows;
}

export interface EmpresaParaUsuario extends EmpresaRow {
  tipoIdsBloqueados: number[];
}

/** Empresas visíveis ao usuário: admin ou sem grupos = todas ativas; com grupos = união das empresas dos grupos. */
export async function findManyForUser(
  apenasAtivos: boolean,
  grupoIds: number[] | undefined,
  isAdmin: boolean
): Promise<EmpresaParaUsuario[]> {
  let rows: EmpresaRow[];
  if (isAdmin || !grupoIds || grupoIds.length === 0) {
    rows = await findMany(apenasAtivos);
  } else {
    const empresaIds = await prisma.grupoEmpresa.findMany({
      where: { grupoId: { in: grupoIds } },
      select: { empresaId: true },
      distinct: ['empresaId'],
    });
    const ids = [...new Set(empresaIds.map((e) => e.empresaId))];
    if (ids.length === 0) return [];
    rows = await prisma.empresa.findMany({
      where: {
        id: { in: ids },
        ...(apenasAtivos ? { ativo: true } : {}),
      },
      orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
    });
  }
  const ids = rows.map((r) => r.id);
  const bloqueados =
    ids.length > 0
      ? await prisma.empresaTipoBloqueado.findMany({
          where: { empresaId: { in: ids } },
          select: { empresaId: true, tipoCertidaoId: true },
        })
      : [];
  const map = new Map<number, number[]>();
  for (const b of bloqueados) {
    const arr = map.get(b.empresaId) ?? [];
    arr.push(b.tipoCertidaoId);
    map.set(b.empresaId, arr);
  }
  return rows.map((r) => ({
    ...r,
    tipoIdsBloqueados: map.get(r.id) ?? [],
  }));
}

export async function findBySlug(slug: string): Promise<EmpresaRow | null> {
  const row = await prisma.empresa.findUnique({
    where: { slug },
  });
  return row;
}

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'empresa';
}

export async function create(nome: string, ordem?: number, cor?: string | null): Promise<EmpresaRow> {
  const slug = toSlug(nome);
  const existing = await prisma.empresa.findUnique({ where: { slug } });
  if (existing) {
    const base = slug + '-';
    let n = 1;
    while (await prisma.empresa.findUnique({ where: { slug: base + n } })) n++;
    return prisma.empresa.create({
      data: { slug: base + n, nome, ordem: ordem ?? 0, cor: cor ?? null },
    });
  }
  return prisma.empresa.create({
    data: { slug, nome, ordem: ordem ?? 0, cor: cor ?? null },
  });
}

export async function update(
  id: number,
  data: { slug?: string; nome?: string; ordem?: number; ativo?: boolean; cor?: string | null }
): Promise<EmpresaRow | null> {
  try {
    const payload: Record<string, unknown> = {};
    if (data.slug != null) payload.slug = toSlug(data.slug);
    if (data.nome != null) payload.nome = data.nome;
    if (data.ordem != null) payload.ordem = data.ordem;
    if (data.ativo != null) payload.ativo = data.ativo;
    if (data.cor !== undefined) payload.cor = data.cor;
    if (Object.keys(payload).length === 0) {
      const r = await prisma.empresa.findUnique({ where: { id } });
      return r;
    }
    return prisma.empresa.update({
      where: { id },
      data: payload as Parameters<typeof prisma.empresa.update>[0]['data'],
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return null;
    throw e;
  }
}

export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.empresa.delete({ where: { id } });
    return true;
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return false;
    throw e;
  }
}

export async function getTiposBloqueados(empresaId: number): Promise<number[]> {
  const rows = await prisma.empresaTipoBloqueado.findMany({
    where: { empresaId },
    select: { tipoCertidaoId: true },
  });
  return rows.map((r) => r.tipoCertidaoId);
}

/** Retorna mapa empresaId -> tipoIdsBloqueados para várias empresas. */
export async function getTiposBloqueadosMap(empresaIds: number[]): Promise<Map<number, number[]>> {
  if (empresaIds.length === 0) return new Map();
  const rows = await prisma.empresaTipoBloqueado.findMany({
    where: { empresaId: { in: empresaIds } },
    select: { empresaId: true, tipoCertidaoId: true },
  });
  const map = new Map<number, number[]>();
  for (const r of rows) {
    const arr = map.get(r.empresaId) ?? [];
    arr.push(r.tipoCertidaoId);
    map.set(r.empresaId, arr);
  }
  return map;
}

export async function setTiposBloqueados(empresaId: number, tipoCertidaoIds: number[]): Promise<void> {
  await prisma.$transaction([
    prisma.empresaTipoBloqueado.deleteMany({ where: { empresaId } }),
    ...(tipoCertidaoIds.length > 0
      ? [
          prisma.empresaTipoBloqueado.createMany({
            data: tipoCertidaoIds.map((tipoCertidaoId) => ({ empresaId, tipoCertidaoId })),
          }),
        ]
      : []),
  ]);
}

export default {
  findMany,
  findManyForUser,
  findBySlug,
  create,
  update,
  remove,
  getTiposBloqueados,
  getTiposBloqueadosMap,
  setTiposBloqueados,
} as const;
