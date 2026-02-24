import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import { jwtMiddleware } from '@src/middleware/jwt.middleware';
import { authContextMiddleware } from '@src/middleware/auth-context.middleware';
import * as GruposController from '@src/controllers/grupos.controller';

const router = Router();
router.use(jwtMiddleware);
router.use(authContextMiddleware);
router.get('/', GruposController.listar);

export default router;
