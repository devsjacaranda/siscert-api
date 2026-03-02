import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import { jwtMiddleware } from '@src/middleware/jwt.middleware';
import { asAuthHandler } from '@src/routes/common/express-types';

import * as PushController from '@src/controllers/push.controller';

/******************************************************************************
 * Router: GET vapid-key (público), POST subscribe / POST unsubscribe (JWT).
 ******************************************************************************/

const pushRouter = Router();

pushRouter.get(Paths.Push.VapidKey, PushController.getVapidPublicKey);
pushRouter.post(Paths.Push.Subscribe, jwtMiddleware, asAuthHandler(PushController.subscribe));
pushRouter.post(Paths.Push.Unsubscribe, jwtMiddleware, asAuthHandler(PushController.unsubscribe));

export default pushRouter;
