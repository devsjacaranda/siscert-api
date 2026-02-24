import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import { jwtMiddleware } from '@src/middleware/jwt.middleware';
import * as NotificacoesController from '@src/controllers/notificacoes.controller';

/******************************************************************************
 * Router: GET/PUT /notificacoes/config. Todas as rotas protegidas por JWT.
 ******************************************************************************/

const notificacoesRouter = Router();

notificacoesRouter.get(Paths.Notificacoes.Config, jwtMiddleware, NotificacoesController.getConfig);
notificacoesRouter.put(Paths.Notificacoes.Config, jwtMiddleware, NotificacoesController.putConfig);

export default notificacoesRouter;
