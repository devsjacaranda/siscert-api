import { z } from 'zod';

export const usuarioCreateSchema = z.object({
  login: z.string().min(1, 'Login é obrigatório').max(100, 'Login muito longo'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nome: z.string().max(200).optional(),
  role: z.enum(['admin', 'usuario']).optional().default('usuario'),
  status: z.enum(['pendente', 'ativo', 'bloqueado']).optional().default('ativo'),
});

export const usuarioUpdateSchema = z.object({
  login: z.string().min(1).max(100).optional(),
  senha: z.string().min(6).optional(),
  nome: z.string().max(200).optional().nullable(),
});

export const grupoCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
});

export const grupoUpdateSchema = z.object({
  nome: z.string().min(1).max(200),
});

const grupoAcessoSchema = z.enum(['comum', 'visualizador']);

export const grupoUsuariosSchema = z.object({
  usuarios: z.array(
    z.object({
      userId: z.number().int().positive(),
      acesso: grupoAcessoSchema.optional().default('comum'),
    })
  ),
});

export const usuarioGruposSchema = z.object({
  grupos: z.array(
    z.object({
      grupoId: z.number().int().positive(),
      acesso: grupoAcessoSchema.optional().default('comum'),
    })
  ),
});

export const grupoEmpresasSchema = z.object({
  empresaIds: z.array(z.number().int().positive()),
});

export const tipoCertidaoCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  ordem: z.number().int().min(0).optional().default(0),
});

export const tipoCertidaoUpdateSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});

export type UsuarioCreateBody = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdateBody = z.infer<typeof usuarioUpdateSchema>;
export type GrupoCreateBody = z.infer<typeof grupoCreateSchema>;
export type GrupoUpdateBody = z.infer<typeof grupoUpdateSchema>;
export type GrupoUsuariosBody = z.infer<typeof grupoUsuariosSchema>;
export type UsuarioGruposBody = z.infer<typeof usuarioGruposSchema>;
export type GrupoEmpresasBody = z.infer<typeof grupoEmpresasSchema>;
export const empresaCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  ordem: z.number().int().min(0).optional().default(0),
  cor: z.string().max(20).nullable().optional(),
});

export const empresaUpdateSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
  cor: z.string().max(20).nullable().optional(),
});

export const empresaTiposBloqueadosSchema = z.object({
  tipoIds: z.array(z.number().int().positive()),
});

export type TipoCertidaoCreateBody = z.infer<typeof tipoCertidaoCreateSchema>;
export type TipoCertidaoUpdateBody = z.infer<typeof tipoCertidaoUpdateSchema>;
export type EmpresaCreateBody = z.infer<typeof empresaCreateSchema>;
export type EmpresaUpdateBody = z.infer<typeof empresaUpdateSchema>;
export type EmpresaTiposBloqueadosBody = z.infer<typeof empresaTiposBloqueadosSchema>;
