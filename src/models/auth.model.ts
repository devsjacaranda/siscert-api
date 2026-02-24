import { z } from 'zod';

/******************************************************************************
 * DTOs e validação (Zod) para auth. Models apenas validação, sem lógica de DB.
 ******************************************************************************/

const loginSchema = z.object({
  login: z.string().min(1, 'Login é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

const cadastroSchema = z.object({
  login: z.string().min(1, 'Login é obrigatório').max(100, 'Login muito longo'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nome: z.string().max(200).optional(),
});

const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  senhaNova: z.string().min(6, 'Senha nova deve ter no mínimo 6 caracteres'),
});

export type LoginBody = z.infer<typeof loginSchema>;
export type CadastroBody = z.infer<typeof cadastroSchema>;
export type TrocarSenhaBody = z.infer<typeof trocarSenhaSchema>;

export function parseLoginBody(body: unknown): LoginBody {
  return loginSchema.parse(body);
}

export function parseCadastroBody(body: unknown): CadastroBody {
  return cadastroSchema.parse(body);
}

export function parseTrocarSenhaBody(body: unknown): TrocarSenhaBody {
  return trocarSenhaSchema.parse(body);
}
