import logger from 'jet-logger';

import PushService from '@src/services/push.service';

/******************************************************************************
 * Job: executa envio de push para certidões próximas do vencimento.
 * Dispara a cada minuto; só envia quando o horário coincide com a config do usuário.
 ******************************************************************************/

function getNowHHMM(): string {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getDiaSemana(): number {
  return new Date().getDay(); // 0=domingo, 1=segunda...
}

export function startPushVencimentosJob(): void {
  const intervalMs = 60 * 1000; // cada minuto

  setInterval(() => {
    void (async () => {
    try {
      const nowHHMM = getNowHHMM();
      const diaSemana = getDiaSemana();

      const users = await PushService.getUsersElegiveisParaPush();

      const algumHorarioMatch = users.some((u) => u.horario === nowHHMM);
      if (!algumHorarioMatch) return;

      const algumFrequenciaMatch = users.some(
        (u) =>
          u.frequencia === 'diaria' ||
          (u.frequencia === 'semanal' && diaSemana === 1)
      );
      if (!algumFrequenciaMatch) return;

      await PushService.executarJobVencimentos(nowHHMM);
    } catch (e) {
      logger.err(e instanceof Error ? e.message : 'Erro no job de push vencimentos');
    }
    })();
  }, intervalMs);

  logger.info('Job de push (vencimentos) iniciado - verifica a cada minuto');
}
