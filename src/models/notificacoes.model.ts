import { z } from 'zod';

/******************************************************************************
 * DTO e validação (Zod) para config de notificações. Alinhado ao frontend.
 ******************************************************************************/

const configNotificacoesSchema = z.object({
  notificacoesLigado: z.boolean(),
  diasAntes: z.number().int().min(0).max(365),
  frequencia: z.enum(['diaria', 'semanal']),
  horario: z.string().regex(/^\d{1,2}:\d{2}$/, 'Horário deve ser HH:mm'),
  enviarParaGoogleCalendar: z.boolean(),
});

export type ConfigNotificacoesBody = z.infer<typeof configNotificacoesSchema>;

export function parseConfigNotificacoesBody(body: unknown): ConfigNotificacoesBody {
  return configNotificacoesSchema.parse(body);
}

export const CONFIG_NOTIFICACOES_PADRAO: ConfigNotificacoesBody = {
  notificacoesLigado: true,
  diasAntes: 30,
  frequencia: 'diaria',
  horario: '09:00',
  enviarParaGoogleCalendar: false,
};
