import prisma from '@src/lib/prisma';

/******************************************************************************
 * Repositório de push subscriptions (Prisma). Sem regras de negócio.
 ******************************************************************************/

export interface PushSubscriptionRow {
  id: number;
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
}

export async function upsert(data: {
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}): Promise<PushSubscriptionRow> {
  const row = await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: { userId: data.userId, endpoint: data.endpoint },
    },
    create: {
      userId: data.userId,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userAgent: data.userAgent ?? undefined,
    },
    update: {
      p256dh: data.p256dh,
      auth: data.auth,
      userAgent: data.userAgent ?? undefined,
    },
  });
  return row as PushSubscriptionRow;
}

export async function findByUserId(userId: number): Promise<PushSubscriptionRow[]> {
  const rows = await prisma.pushSubscription.findMany({
    where: { userId },
  });
  return rows as PushSubscriptionRow[];
}

export async function deleteByUserIdAndEndpoint(
  userId: number,
  endpoint: string
): Promise<boolean> {
  const result = await prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
  return result.count > 0;
}

export default {
  upsert,
  findByUserId,
  deleteByUserIdAndEndpoint,
} as const;
