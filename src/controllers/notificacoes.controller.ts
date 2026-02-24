import { ZodError } from 'zod';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { parseConfigNotificacoesBody } from '@src/models/notificacoes.model';
import NotificacoesService from '@src/services/notificacoes.service';
import type { AuthReq, Res } from '@src/routes/common/express-types';

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
 * Controller: GET/PUT config de notificações. Requer JWT (req.userId).
 ******************************************************************************/

export async function getConfig(req: AuthReq, res: Res): Promise<void> {
  try {
    const userId = req.userId;
    const config = await NotificacoesService.getConfig(userId);
    res.status(HttpStatusCodes.OK).json(config);
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    throw e;
  }
}

export async function putConfig(req: AuthReq, res: Res): Promise<void> {
  try {
    const userId = req.userId;
    const body = parseBody(parseConfigNotificacoesBody, req.body);
    const config = await NotificacoesService.saveConfig(userId, body);
    res.status(HttpStatusCodes.OK).json(config);
  } catch (e) {
    if (e instanceof RouteError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- e.status is number (HttpStatusCodes)
      res.status(e.status).json({ error: e.message });
      return;
    }
    throw e;
  }
}
