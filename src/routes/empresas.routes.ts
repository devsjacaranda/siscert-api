import { Router } from 'express';
import { jwtMiddleware } from '@src/middleware/jwt.middleware';
import { authContextMiddleware } from '@src/middleware/auth-context.middleware';
import * as EmpresasController from '@src/controllers/empresas.controller';

const router = Router();
router.use(jwtMiddleware);
router.use(authContextMiddleware);
router.get('/', EmpresasController.listar);

export default router;
