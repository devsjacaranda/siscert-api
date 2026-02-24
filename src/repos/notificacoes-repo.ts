import prisma from '@src/lib/prisma';
import type { ConfigNotificacoesBody } from '@src/models/notificacoes.model';

/******************************************************************************
 * Repositório: persistência de ConfigNotificacao por userId.
 ******************************************************************************/

export interface ConfigNotificacaoRow {
  notificacoesLigado: boolean;
  diasAntes: number;
  frequencia: string;
  horario: string;
  enviarParaGoogleCalendar: boolean;
}

export async function getByUserId(userId: number): Promise<ConfigNotificacaoRow | null> {
  const row = await prisma.configNotificacao.findUnique({
    where: { userId },
  });
  return row;
}

export async function save(userId: number, config: ConfigNotificacoesBody): Promise<ConfigNotificacaoRow> {
  const row = await prisma.configNotificacao.upsert({
    where: { userId },
    create: {
      userId,
      notificacoesLigado: config.notificacoesLigado,
      diasAntes: config.diasAntes,
      frequencia: config.frequencia,
      horario: config.horario,
      enviarParaGoogleCalendar: config.enviarParaGoogleCalendar,
    },
    update: {
      notificacoesLigado: config.notificacoesLigado,
      diasAntes: config.diasAntes,
      frequencia: config.frequencia,
      horario: config.horario,
      enviarParaGoogleCalendar: config.enviarParaGoogleCalendar,
    },
  });
  return row;
}

export default {
  getByUserId,
  save,
} as const;
