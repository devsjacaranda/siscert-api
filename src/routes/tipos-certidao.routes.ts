import { Router } from 'express';
import * as TiposCertidaoController from '@src/controllers/tipos-certidao.controller';

const router = Router();
router.get('/', TiposCertidaoController.listar);

export default router;
