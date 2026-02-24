import { ZodError } from 'zod';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { parsePushSubscribeBody } from '@src/models/push.model';
import PushService from '@src/services/push.service';
import type { AuthReq, Req, Res } from '@src/routes/common/express-types';

function parseBody<T>(parse: (body: unknown) => T, body: unknown): T {
  try {
    return parse(body);
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Dados inválidos';
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, msg);
    }
    throw e;
  }
}

/******************************************************************************
 * Controller: endpoints de Web Push. POST/DELETE requerem JWT.
 ******************************************************************************/

export function getVapidPublicKey(_req: Req, res: Res): void {
  try {
    const key = PushService.getVapidPublicKey();
    res.status(HttpStatusCodes.OK).json({ publicKey: key });
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- RouteError.status is number
      res.status(e.status).json({ error: e.message });
      return;
    }
    if (e instanceof Error && e.message.includes('VAPID')) {
      res.status(HttpStatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'Push notifications não configuradas. Defina VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY.',
      });
      return;
    }
    throw e;
  }
}

export async function subscribe(req: AuthReq, res: Res): Promise<void> {
  try {
    const userId = req.userId;
    const body = parseBody(parsePushSubscribeBody, req.body);
    await PushService.subscribe(userId, {
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: body.userAgent,
    });
    res.status(HttpStatusCodes.CREATED).json({ ok: true });
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- RouteError.status is number
      res.status(e.status).json({ error: e.message });
      return;
    }
    throw e;
  }
}

export async function unsubscribe(req: AuthReq, res: Res): Promise<void> {
  try {
    const userId = req.userId;
    const endpoint = (req.body as { endpoint?: string } | undefined)?.endpoint;
    if (!endpoint || typeof endpoint !== 'string') {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'endpoint é obrigatório');
    }
    const deleted = await PushService.unsubscribe(userId, endpoint);
    res.status(HttpStatusCodes.OK).json({ ok: true, deleted });
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- RouteError.status is number
      res.status(e.status).json({ error: e.message });
      return;
    }
    throw e;
  }
}
