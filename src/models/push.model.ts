import { z } from 'zod';

/******************************************************************************
 * Validação Zod para subscription Web Push (PushSubscription JSON do browser).
 ******************************************************************************/

const pushSubscribeSchema = z
  .object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1, 'p256dh é obrigatório'),
      auth: z.string().min(1, 'auth é obrigatório'),
    }),
    userAgent: z.string().optional(),
  })
  .strict();

export type PushSubscribeBody = z.infer<typeof pushSubscribeSchema>;

export function parsePushSubscribeBody(body: unknown): PushSubscribeBody {
  return pushSubscribeSchema.parse(body);
}
