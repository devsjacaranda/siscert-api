import type { ConfigNotificacoesBody } from '@src/models/notificacoes.model';
import { CONFIG_NOTIFICACOES_PADRAO } from '@src/models/notificacoes.model';
import NotificacoesRepo from '@src/repos/notificacoes-repo';

/******************************************************************************
 * Regras de negócio: ler/gravar config de notificações por usuário.
 ******************************************************************************/

export async function getConfig(userId: number): Promise<ConfigNotificacoesBody> {
  const row = await NotificacoesRepo.getByUserId(userId);
  if (!row) {
    return CONFIG_NOTIFICACOES_PADRAO;
  }
  return {
    notificacoesLigado: row.notificacoesLigado,
    diasAntes: row.diasAntes,
    frequencia: row.frequencia === 'semanal' ? 'semanal' : 'diaria',
    horario: row.horario,
    enviarParaGoogleCalendar: row.enviarParaGoogleCalendar,
  };
}

export async function saveConfig(
  userId: number,
  config: ConfigNotificacoesBody
): Promise<ConfigNotificacoesBody> {
  const row = await NotificacoesRepo.save(userId, config);
  return {
    notificacoesLigado: row.notificacoesLigado,
    diasAntes: row.diasAntes,
    frequencia: row.frequencia === 'semanal' ? 'semanal' : 'diaria',
    horario: row.horario,
    enviarParaGoogleCalendar: row.enviarParaGoogleCalendar,
  };
}

export default {
  getConfig,
  saveConfig,
} as const;
