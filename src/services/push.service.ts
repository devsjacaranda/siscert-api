import webPush from 'web-push';

import AuthRepo from '@src/repos/AuthRepo';
import * as certidaoRepo from '@src/repos/certidao-repo';
import * as pushRepo from '@src/repos/push-repo';
import prisma from '@src/lib/prisma';

/******************************************************************************
 * Regras de negócio: subscribe/unsubscribe e envio de push notifications.
 ******************************************************************************/

const CONTACT_EMAIL = 'mailto:noreply@siscert.local';
let vapidInitialized = false;

function ensureVapid(): void {
  /* eslint-disable no-process-env */
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error(
      'VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY devem estar definidos. Execute: npx web-push generate-vapid-keys'
    );
  }
  if (!vapidInitialized) {
    webPush.setVapidDetails(CONTACT_EMAIL, publicKey, privateKey);
    vapidInitialized = true;
  }
  /* eslint-enable no-process-env */
}

export function getVapidPublicKey(): string {
  ensureVapid();
  /* eslint-disable no-process-env */
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) throw new Error('VAPID_PUBLIC_KEY não definida');
  /* eslint-enable no-process-env */
  return key;
}

export async function subscribe(
  userId: number,
  data: { endpoint: string; p256dh: string; auth: string; userAgent?: string }
): Promise<void> {
  await pushRepo.upsert({
    userId,
    endpoint: data.endpoint,
    p256dh: data.p256dh,
    auth: data.auth,
    userAgent: data.userAgent,
  });
}

export async function unsubscribe(userId: number, endpoint: string): Promise<boolean> {
  return pushRepo.deleteByUserIdAndEndpoint(userId, endpoint);
}

export interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  certidoes?: Array<{ id: string; nome?: string; dataValidade: string; empresa: string }>;
}

async function sendToSubscription(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<void> {
  ensureVapid();
  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  };
  await webPush.sendNotification(
    pushSubscription,
    JSON.stringify(payload),
    { TTL: 60 * 60 * 24 } // 24h
  );
}

/** Envia push para todas as subscriptions de um usuário. Falhas individuais não impedem outras. */
export async function sendToUser(userId: number, payload: PushPayload): Promise<void> {
  const subs = await pushRepo.findByUserId(userId);
  const results = await Promise.allSettled(
    subs.map((sub) => sendToSubscription(sub, payload))
  );
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected') {
      const err = results[i] as PromiseRejectedResult;
      const statusCode = err.reason && typeof err.reason === 'object' && 'statusCode' in err.reason
        ? (err.reason as { statusCode?: number }).statusCode
        : undefined;
      if (statusCode === 410 || statusCode === 404) {
        await pushRepo.deleteByUserIdAndEndpoint(userId, subs[i].endpoint);
      }
    }
  }
}

/** Usuários elegíveis para push: notificações ligadas, config existe, tem subscription. */
export async function getUsersElegiveisParaPush(): Promise<
  Array<{ userId: number; diasAntes: number; horario: string; frequencia: string }>
> {
  const users = await prisma.user.findMany({
    where: {
      configNotificacoes: {
        notificacoesLigado: true,
      },
      pushSubscriptions: { some: {} },
    },
    include: {
      configNotificacoes: true,
      pushSubscriptions: true,
    },
  });

  return users
    .filter((u) => u.configNotificacoes && u.pushSubscriptions.length > 0)
    .map((u) => ({
      userId: u.id,
      diasAntes: u.configNotificacoes!.diasAntes,
      horario: u.configNotificacoes!.horario,
      frequencia: u.configNotificacoes!.frequencia,
    }));
}

/** Executa o job de envio de push para certidões próximas do vencimento. */
export async function executarJobVencimentos(horarioFiltro?: string): Promise<void> {
  let users = await getUsersElegiveisParaPush();
  if (horarioFiltro) {
    users = users.filter((u) => u.horario === horarioFiltro);
  }
  for (const u of users) {
    const grupoIds = await AuthRepo.getGruposByUserId(u.userId);
    const user = await AuthRepo.findById(u.userId);
    const isAdmin = user?.role === 'admin';
    const certidoes = await certidaoRepo.findProximasVencimento(u.diasAntes, {
      grupoIds: isAdmin ? undefined : grupoIds,
      isAdmin,
    });
    if (certidoes.length === 0) continue;

    const payload: PushPayload = {
      title: 'Siscert: certidões próximas do vencimento',
      body: `${certidoes.length} certidão(ões) próxima(s) de vencer.`,
      url: '/',
      certidoes: certidoes.slice(0, 10).map((c) => ({
        id: c.id,
        nome: c.nome ?? undefined,
        dataValidade: c.dataValidade,
        empresa: c.empresa,
      })),
    };
    await sendToUser(u.userId, payload);
  }
}

export default {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  sendToUser,
  getUsersElegiveisParaPush,
  executarJobVencimentos,
} as const;
