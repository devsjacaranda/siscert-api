import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import * as CertidaoController from '@src/controllers/certidao.controller';

/******************************************************************************
 * Router: apenas mapeamento de endpoints para métodos do controller.
 ******************************************************************************/

const certidaoRouter = Router();

certidaoRouter.get(Paths.Certidoes.List, CertidaoController.listar);
certidaoRouter.post(Paths.Certidoes.List, CertidaoController.criar);
certidaoRouter.patch(Paths.Certidoes.Arquivar, CertidaoController.arquivar);
certidaoRouter.patch(Paths.Certidoes.Restaurar, CertidaoController.restaurar);
certidaoRouter.post(Paths.Certidoes.Duplicar, CertidaoController.duplicar);
certidaoRouter.get(Paths.Certidoes.ById, CertidaoController.obter);
certidaoRouter.put(Paths.Certidoes.ById, CertidaoController.atualizar);
certidaoRouter.delete(Paths.Certidoes.ById, CertidaoController.excluir);

export default certidaoRouter;
