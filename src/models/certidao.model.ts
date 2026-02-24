import { z } from 'zod';

/******************************************************************************
 * DTOs e validação (Zod) para certidões. Models apenas validação, sem lógica de DB.
 ******************************************************************************/

const empresaSchema = z.enum(['salviam', 'jacaranda']);
const tipoDocumentoSchema = z.enum(['PDF', 'Link', 'Documento']);
const statusCertidaoVidaSchema = z.enum(['ativa', 'arquivada', 'lixeira']);

const dateStringSchema = z
  .string()
  .min(1, 'Data é obrigatória')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD');

const pendenciaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  descricao: z.string().optional(),
  prazo: z.string().optional(),
  concluida: z.boolean(),
});

const documentoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  url: z.string(),
  tipo: tipoDocumentoSchema,
  dataAdicao: z.string(),
});

const notaSchema = z.object({
  id: z.string(),
  texto: z.string(),
  dataHora: z.string(),
});

/** Payload para criar certidão (sem id). */
export const certidaoCreateSchema = z
  .object({
    empresa: empresaSchema,
    tipo: z.string().min(1, 'Tipo da certidão é obrigatório'),
    nome: z.string().optional(),
    descricao: z.string().optional(),
    dataEmissao: dateStringSchema,
    dataValidade: dateStringSchema,
    tipoDocumento: tipoDocumentoSchema,
    urlDocumento: z.string().optional(),
    alertaAtivo: z.boolean().default(true),
    notificarDiasAntes: z.number().int().min(1).max(365).optional(),
    observacoes: z.string().optional(),
    pendencias: z.array(pendenciaSchema).default([]),
    documentosAdicionais: z.array(documentoSchema).default([]),
    notas: z.array(notaSchema).default([]),
    grupoId: z.number().int().positive().optional().nullable(),
  })
  .refine(
    (data) => new Date(data.dataValidade) >= new Date(data.dataEmissao),
    { message: 'Data de validade deve ser posterior ou igual à emissão.', path: ['dataValidade'] }
  );

/** Payload para atualizar certidão (todos os campos opcionais). */
export const certidaoUpdateSchema = z
  .object({
    empresa: empresaSchema.optional(),
    tipo: z.string().min(1).optional(),
    nome: z.string().optional(),
    descricao: z.string().optional(),
    dataEmissao: dateStringSchema.optional(),
    dataValidade: dateStringSchema.optional(),
    tipoDocumento: tipoDocumentoSchema.optional(),
    urlDocumento: z.string().optional(),
    alertaAtivo: z.boolean().optional(),
    notificarDiasAntes: z.number().int().min(1).max(365).optional().nullable(),
    observacoes: z.string().optional().nullable(),
    pendencias: z.array(pendenciaSchema).optional(),
    documentosAdicionais: z.array(documentoSchema).optional(),
    notas: z.array(notaSchema).optional(),
    status: statusCertidaoVidaSchema.optional(),
    /** ISO date string; quando status lixeira, enviado pelo frontend. */
    dataExclusao: z.string().optional().nullable(),
    grupoId: z.number().int().positive().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.dataEmissao == null || data.dataValidade == null) return true;
      return new Date(data.dataValidade) >= new Date(data.dataEmissao);
    },
    { message: 'Data de validade deve ser posterior ou igual à emissão.', path: ['dataValidade'] }
  );

export type CertidaoCreateBody = z.infer<typeof certidaoCreateSchema>;
export type CertidaoUpdateBody = z.infer<typeof certidaoUpdateSchema>;

export function parseCertidaoCreateBody(body: unknown): CertidaoCreateBody {
  return certidaoCreateSchema.parse(body);
}

export function parseCertidaoUpdateBody(body: unknown): CertidaoUpdateBody {
  return certidaoUpdateSchema.parse(body);
}
