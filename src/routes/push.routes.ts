import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import { jwtMiddleware } from '@src/middleware/jwt.middleware';

import * as PushController from '@src/controllers/push.controller';

/******************************************************************************
 * Router: GET vapid-key (público), POST subscribe / POST unsubscribe (JWT).
 ******************************************************************************/

const pushRouter = Router();

pushRouter.get(Paths.Push.VapidKey, PushController.getVapidPublicKey);
pushRouter.post(Paths.Push.Subscribe, jwtMiddleware, PushController.subscribe);
pushRouter.post(Paths.Push.Unsubscribe, jwtMiddleware, PushController.unsubscribe);

export default pushRouter;
