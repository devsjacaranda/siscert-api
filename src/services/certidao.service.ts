import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import CertidaoRepo, { type CertidaoApi, type StatusCertidaoVida } from '@src/repos/certidao-repo';
import type { CertidaoCreateBody, CertidaoUpdateBody } from '@src/models/certidao.model';

const ERRORS = {
  NOT_FOUND: 'Certidão não encontrada',
} as const;

/******************************************************************************
 * Regras de negócio de certidões. Delega persistência ao repositório.
 ******************************************************************************/

export async function listar(filtro?: { status?: StatusCertidaoVida }): Promise<CertidaoApi[]> {
  return CertidaoRepo.findMany(filtro);
}

export async function obter(id: string): Promise<CertidaoApi> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  return cert;
}

export async function criar(body: CertidaoCreateBody): Promise<CertidaoApi> {
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
  });
}

export async function atualizar(id: string, body: CertidaoUpdateBody): Promise<CertidaoApi> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);

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
  };
  if (body.dataExclusao !== undefined) {
    updateData.dataExclusao = body.dataExclusao != null ? new Date(body.dataExclusao) : null;
  }
  const updated = await CertidaoRepo.update(id, updateData);
  if (!updated) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  return updated;
}

/** Excluir permanentemente (remove do banco). */
export async function excluir(id: string): Promise<void> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  await CertidaoRepo.remove(id);
}

/** Arquivar certidão. */
export async function arquivar(id: string): Promise<CertidaoApi> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  const updated = await CertidaoRepo.arquivar(id);
  if (!updated) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  return updated;
}

/** Restaurar certidão (da lixeira ou arquivadas). */
export async function restaurar(id: string): Promise<CertidaoApi> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  const updated = await CertidaoRepo.restaurar(id);
  if (!updated) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  return updated;
}

/** Duplicar certidão (nova com mesmo conteúdo, sem id). */
export async function duplicar(id: string): Promise<CertidaoApi> {
  const cert = await CertidaoRepo.findById(id);
  if (!cert) throw new RouteError(HttpStatusCodes.NOT_FOUND, ERRORS.NOT_FOUND);
  const { id: _id, ...rest } = cert;
  return CertidaoRepo.create({
    ...rest,
    pendencias: cert.pendencias,
    documentosAdicionais: cert.documentosAdicionais,
    notas: cert.notas,
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
