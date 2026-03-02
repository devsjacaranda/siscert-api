import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import CertidaoRepo, { type CertidaoApi, type StatusCertidaoVida } from '@src/repos/certidao-repo';
import type { CertidaoCreateBody, CertidaoUpdateBody } from '@src/models/certidao.model';

const ERRORS = {
  NOT_FOUND: 'Certidão não encontrada',
  FORBIDDEN: 'Sem permissão para acessar esta certidão',
  FORBIDDEN_EDIT: 'Sem permissão para editar esta certidão (apenas visualização)',
} as const;

export type AuthContext = {
  isAdmin: boolean;
  grupoIds: number[];
  grupoAcesso: Record<number, 'comum' | 'visualizador'>;
};

function canAccess(cert: { grupoId?: number | null }, ctx: AuthContext): boolean {
  if (ctx.isAdmin) return true;
  if (cert.grupoId == null) return true;
  return ctx.grupoIds.includes(cert.grupoId);
}

function canEditCertidao(cert: { grupoId?: number | null }, ctx: AuthContext): boolean {
  if (ctx.isAdmin) return true;
  if (cert.grupoId == null) return false; // Certidões globais: só admin edita
  const acesso = ctx.grupoAcesso[cert.grupoId];
  return acesso === 'comum';
}

/******************************************************************************
 * Regras de negócio de certidões. Delega persistência ao repositório.
 ******************************************************************************/

export interface CertidaoComPermissao extends CertidaoApi {
  podeEditar: boolean;
}

export async function listar(
  filtro: { status?: StatusCertidaoVida } | undefined,
  ctx: AuthContext
): Promise<CertidaoComPermissao[]> {
  const certidoes = await CertidaoRepo.findMany({
    ...filtro,
    grupoIds: ctx.isAdmin ? undefined : ctx.grupoIds,
    isAdmin: ctx.isAdmin,
  });
  return certidoes.map((c) => ({
    ...c,
    podeEditar: canEditCertidao(c, ctx),
  }));
}

export async function obter(id: string, ctx: AuthContext): Promise<CertidaoApi & { podeEditar: boolean }> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  if (!canAccess(cert, ctx)) throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN);
  return { ...cert, podeEditar: canEditCertidao(cert, ctx) };
}

export async function criar(body: CertidaoCreateBody, ctx: AuthContext): Promise<CertidaoApi> {
  if (!ctx.isAdmin && body.grupoId != null && !ctx.grupoIds.includes(body.grupoId)) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN);
  }
  if (!ctx.isAdmin && body.grupoId != null && ctx.grupoAcesso[body.grupoId] !== 'comum') {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN_EDIT);
  }
  if (!ctx.isAdmin && body.grupoId == null) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN_EDIT);
  }
  return CertidaoRepo.create({
    empresa: body.empresa,
    tipo: body.tipo,
    nome: body.nome ?? null,
    descricao: body.descricao ?? null,
    dataEmissao: body.dataEmissao,
    dataValidade: body.dataValidade,
    tipoDocumento: body.tipoDocumento,
    urlDocumento: body.urlDocumento ?? null,
    alertaAtivo: body.alertaAtivo ?? true,
    notificarDiasAntes: body.notificarDiasAntes ?? null,
    observacoes: body.observacoes ?? null,
    pendencias: body.pendencias ?? [],
    documentosAdicionais: body.documentosAdicionais ?? [],
    notas: body.notas ?? [],
    grupoId: body.grupoId ?? undefined,
  });
}

export async function atualizar(
  id: string,
  body: CertidaoUpdateBody,
  ctx: AuthContext
): Promise<CertidaoApi> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  if (!canAccess(cert, ctx)) throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN);
  if (!canEditCertidao(cert, ctx)) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN_EDIT);
  }
  if (!ctx.isAdmin && body.grupoId != null && !ctx.grupoIds.includes(body.grupoId)) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN);
  }

  const updateData: Parameters<typeof CertidaoRepo.update>[1] = {
    ...(body.empresa != null && { empresa: body.empresa }),
    ...(body.tipo != null && { tipo: body.tipo }),
    ...(body.nome !== undefined && { nome: body.nome }),
    ...(body.descricao !== undefined && { descricao: body.descricao }),
    ...(body.dataEmissao != null && { dataEmissao: body.dataEmissao }),
    ...(body.dataValidade != null && { dataValidade: body.dataValidade }),
    ...(body.tipoDocumento != null && { tipoDocumento: body.tipoDocumento }),
    ...(body.urlDocumento !== undefined && { urlDocumento: body.urlDocumento }),
    ...(body.alertaAtivo !== undefined && { alertaAtivo: body.alertaAtivo }),
    ...(body.notificarDiasAntes !== undefined && { notificarDiasAntes: body.notificarDiasAntes }),
    ...(body.observacoes !== undefined && { observacoes: body.observacoes }),
    ...(body.pendencias !== undefined && { pendencias: body.pendencias }),
    ...(body.documentosAdicionais !== undefined && { documentosAdicionais: body.documentosAdicionais }),
    ...(body.notas !== undefined && { notas: body.notas }),
    ...(body.status != null && { status: body.status }),
    ...(body.grupoId !== undefined && { grupoId: body.grupoId }),
  };
  if (body.dataExclusao !== undefined) {
    updateData.dataExclusao = body.dataExclusao != null ? new Date(body.dataExclusao) : null;
  }
  const updated = await CertidaoRepo.update(id, updateData);
  if (!updated) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  return updated;
}

/** Excluir permanentemente (remove do banco). */
export async function excluir(id: string, ctx: AuthContext): Promise<void> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  if (!canAccess(cert, ctx)) throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN);
  if (!canEditCertidao(cert, ctx)) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN_EDIT);
  }
  await CertidaoRepo.remove(id);
}

/** Arquivar certidão. */
export async function arquivar(id: string, ctx: AuthContext): Promise<CertidaoApi> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  if (!canAccess(cert, ctx)) throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN);
  if (!canEditCertidao(cert, ctx)) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN_EDIT);
  }
  const updated = await CertidaoRepo.arquivar(id);
  if (!updated) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  return updated;
}

/** Restaurar certidão (da lixeira ou arquivadas). */
export async function restaurar(id: string, ctx: AuthContext): Promise<CertidaoApi> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  if (!canAccess(cert, ctx)) throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN);
  if (!canEditCertidao(cert, ctx)) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN_EDIT);
  }
  const updated = await CertidaoRepo.restaurar(id);
  if (!updated) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  return updated;
}

/** Duplicar certidão (nova com mesmo conteúdo, sem id). */
export async function duplicar(id: string, ctx: AuthContext): Promise<CertidaoApi> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  if (!canAccess(cert, ctx)) throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN);
  if (!canEditCertidao(cert, ctx)) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, ERRORS.FORBIDDEN_EDIT);
  }
  const { id: _id, ...rest } = cert;
  return CertidaoRepo.create({
    ...rest,
    pendencias: cert.pendencias,
    documentosAdicionais: cert.documentosAdicionais,
    notas: cert.notas,
    grupoId: cert.grupoId ?? undefined,
  });
}

export default {
  listar,
  obter,
  criar,
  atualizar,
  excluir,
  arquivar,
  restaurar,
  duplicar,
} as const;
