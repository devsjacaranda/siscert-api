import type { Certidao as PrismaCertidao } from '../../generated/prisma/client';
import prisma from '@src/lib/prisma';

/******************************************************************************
 * Tipo de resposta da API (compatível com frontend Certidao).
 ******************************************************************************/

export interface CertidaoApi {
  id: string;
  empresa: 'salviam' | 'jacaranda';
  tipo: string;
  nome?: string | null;
  descricao?: string | null;
  dataEmissao: string;
  dataValidade: string;
  tipoDocumento: string;
  urlDocumento?: string | null;
  alertaAtivo: boolean;
  notificarDiasAntes?: number | null;
  observacoes?: string | null;
  pendencias: Array<{ id: string; titulo: string; descricao?: string; prazo?: string; concluida: boolean }>;
  documentosAdicionais: Array<{ id: string; nome: string; url: string; tipo: string; dataAdicao: string }>;
  notas: Array<{ id: string; texto: string; dataHora: string }>;
  status?: string;
  dataExclusao?: string | null;
  grupoId?: number | null;
}

function rowToApi(row: PrismaCertidao): CertidaoApi {
  const pendencias = Array.isArray(row.pendencias) ? row.pendencias : [];
  const documentosAdicionais = Array.isArray(row.documentosAdicionais) ? row.documentosAdicionais : [];
  const notas = Array.isArray(row.notas) ? row.notas : [];
  return {
    id: row.id,
    empresa: row.empresa as 'salviam' | 'jacaranda',
    tipo: row.tipo,
    nome: row.nome,
    descricao: row.descricao,
    dataEmissao: row.dataEmissao,
    dataValidade: row.dataValidade,
    tipoDocumento: row.tipoDocumento,
    urlDocumento: row.urlDocumento,
    alertaAtivo: row.alertaAtivo,
    notificarDiasAntes: row.notificarDiasAntes,
    observacoes: row.observacoes,
    pendencias: pendencias as CertidaoApi['pendencias'],
    documentosAdicionais: documentosAdicionais as CertidaoApi['documentosAdicionais'],
    notas: notas as CertidaoApi['notas'],
    status: row.status,
    dataExclusao: row.dataExclusao != null ? row.dataExclusao.toISOString() : undefined,
    grupoId: row.grupoId ?? undefined,
  };
}

/******************************************************************************
 * Repositório de certidões (Prisma). Sem regras de negócio.
 ******************************************************************************/

export type StatusCertidaoVida = 'ativa' | 'arquivada' | 'lixeira';

export type FindManyFiltro = {
  status?: StatusCertidaoVida;
  grupoIds?: number[] | null;
  isAdmin?: boolean;
};

export async function findMany(filtro?: FindManyFiltro): Promise<CertidaoApi[]> {
  const where: Parameters<typeof prisma.certidao.findMany>[0]['where'] = {};
  if (filtro?.status != null) where.status = filtro.status;
  if (filtro?.isAdmin !== true && filtro?.grupoIds != null) {
    where.OR = [
      { grupoId: null },
      { grupoId: { in: filtro.grupoIds } },
    ];
  }
  const rows = await prisma.certidao.findMany({
    where,
    orderBy: [{ dataValidade: 'asc' }],
  });
  return rows.map(rowToApi);
}

/** Certidões ativas com alerta ligado, que vencem dentro de X dias. */
export async function findProximasVencimento(
  diasAntes: number,
  filtro?: { grupoIds?: number[] | null; isAdmin?: boolean }
): Promise<CertidaoApi[]> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = new Date(hoje);
  limite.setDate(limite.getDate() + diasAntes);

  const where: Parameters<typeof prisma.certidao.findMany>[0]['where'] = {
    status: 'ativa',
    alertaAtivo: true,
    dataValidade: {
      gte: hoje.toISOString().slice(0, 10),
      lte: limite.toISOString().slice(0, 10),
    },
  };
  if (filtro?.isAdmin !== true && filtro?.grupoIds != null) {
    where.OR = [{ grupoId: null }, { grupoId: { in: filtro.grupoIds } }];
  }

  const rows = await prisma.certidao.findMany({
    where,
    orderBy: [{ dataValidade: 'asc' }],
  });
  return rows.map(rowToApi);
}

export async function findById(id: string): Promise<CertidaoApi | null> {
  const row = await prisma.certidao.findUnique({
    where: { id },
  });
  return row ? rowToApi(row) : null;
}

export async function create(data: {
  empresa: string;
  tipo: string;
  nome?: string | null;
  descricao?: string | null;
  dataEmissao: string;
  dataValidade: string;
  tipoDocumento: string;
  urlDocumento?: string | null;
  alertaAtivo: boolean;
  notificarDiasAntes?: number | null;
  observacoes?: string | null;
  pendencias: unknown;
  documentosAdicionais: unknown;
  notas: unknown;
  grupoId?: number | null;
}): Promise<CertidaoApi> {
  const row = await prisma.certidao.create({
    data: {
      empresa: data.empresa,
      tipo: data.tipo,
      nome: data.nome ?? undefined,
      descricao: data.descricao ?? undefined,
      dataEmissao: data.dataEmissao,
      dataValidade: data.dataValidade,
      tipoDocumento: data.tipoDocumento,
      urlDocumento: data.urlDocumento ?? undefined,
      alertaAtivo: data.alertaAtivo,
      notificarDiasAntes: data.notificarDiasAntes ?? undefined,
      observacoes: data.observacoes ?? undefined,
      pendencias: data.pendencias as object,
      documentosAdicionais: data.documentosAdicionais as object,
      notas: data.notas as object,
      status: 'ativa',
      grupoId: data.grupoId ?? undefined,
    },
  });
  return rowToApi(row);
}

function buildUpdateData(data: {
  empresa?: string;
  tipo?: string;
  nome?: string | null;
  descricao?: string | null;
  dataEmissao?: string;
  dataValidade?: string;
  tipoDocumento?: string;
  urlDocumento?: string | null;
  alertaAtivo?: boolean;
  notificarDiasAntes?: number | null;
  observacoes?: string | null;
  pendencias?: unknown;
  documentosAdicionais?: unknown;
  notas?: unknown;
  status?: string;
  dataExclusao?: Date | null;
  grupoId?: number | null;
}): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (data.empresa != null) out.empresa = data.empresa;
  if (data.tipo != null) out.tipo = data.tipo;
  if (data.nome !== undefined) out.nome = data.nome;
  if (data.descricao !== undefined) out.descricao = data.descricao;
  if (data.dataEmissao != null) out.dataEmissao = data.dataEmissao;
  if (data.dataValidade != null) out.dataValidade = data.dataValidade;
  if (data.tipoDocumento != null) out.tipoDocumento = data.tipoDocumento;
  if (data.urlDocumento !== undefined) out.urlDocumento = data.urlDocumento;
  if (data.alertaAtivo !== undefined) out.alertaAtivo = data.alertaAtivo;
  if (data.notificarDiasAntes !== undefined) out.notificarDiasAntes = data.notificarDiasAntes;
  if (data.observacoes !== undefined) out.observacoes = data.observacoes;
  if (data.pendencias !== undefined) out.pendencias = data.pendencias;
  if (data.documentosAdicionais !== undefined) out.documentosAdicionais = data.documentosAdicionais;
  if (data.notas !== undefined) out.notas = data.notas;
  if (data.status != null) out.status = data.status;
  if (data.dataExclusao !== undefined) out.dataExclusao = data.dataExclusao;
  if (data.grupoId !== undefined) out.grupoId = data.grupoId;
  return out;
}

export async function update(
  id: string,
  data: {
    empresa?: string;
    tipo?: string;
    nome?: string | null;
    descricao?: string | null;
    dataEmissao?: string;
    dataValidade?: string;
    tipoDocumento?: string;
    urlDocumento?: string | null;
    alertaAtivo?: boolean;
    notificarDiasAntes?: number | null;
    observacoes?: string | null;
    pendencias?: unknown;
    documentosAdicionais?: unknown;
    notas?: unknown;
    status?: string;
    dataExclusao?: Date | null;
    grupoId?: number | null;
  }
): Promise<CertidaoApi | null> {
  const payload = buildUpdateData(data);
  if (Object.keys(payload).length === 0) return findById(id);
  try {
    const row = await prisma.certidao.update({
      where: { id },
      data: payload as Parameters<typeof prisma.certidao.update>[0]['data'],
    });
    return rowToApi(row);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return null;
    throw e;
  }
}

/** Envia certidão para a lixeira (soft delete). */
export async function enviarParaLixeira(id: string): Promise<CertidaoApi | null> {
  return update(id, { status: 'lixeira', dataExclusao: new Date() });
}

/** Arquivar certidão. */
export async function arquivar(id: string): Promise<CertidaoApi | null> {
  return update(id, { status: 'arquivada' });
}

/** Restaurar para ativa (da lixeira ou arquivadas). */
export async function restaurar(id: string): Promise<CertidaoApi | null> {
  return update(id, { status: 'ativa', dataExclusao: null });
}

export async function remove(id: string): Promise<boolean> {
  const result = await prisma.certidao.deleteMany({
    where: { id },
  });
  return result.count > 0;
}

export default {
  findMany,
  findById,
  create,
  update,
  remove,
  enviarParaLixeira,
  arquivar,
  restaurar,
} as const;
