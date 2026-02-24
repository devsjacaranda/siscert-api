import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import { jwtMiddleware } from '@src/middleware/jwt.middleware';

import AuthRoutes from './AuthRoutes';
import UserRoutes from './UserRoutes';
import certidaoRouter from './certidao.routes';
import notificacoesRouter from './notificacoes.routes';
import pushRouter from './push.routes';
import adminRouter from './admin.routes';
import tiposCertidaoRouter from './tipos-certidao.routes';
import empresasRouter from './empresas.routes';
import gruposRouter from './grupos.routes';

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// ----------------------- Auth ------------------------------------------- //

const authRouter = Router();
authRouter.post(Paths.Auth.Cadastro, AuthRoutes.cadastro);
authRouter.post(Paths.Auth.Login, AuthRoutes.login);
authRouter.post(Paths.Auth.TrocarSenha, jwtMiddleware, AuthRoutes.trocarSenha);
apiRouter.use(Paths.Auth._, authRouter);

// ----------------------- Tipos de certidão (público) -------------------- //

apiRouter.use(Paths.TiposCertidao._, tiposCertidaoRouter);

// ----------------------- Empresas (público) ---------------------------- //

apiRouter.use(Paths.Empresas._, empresasRouter);

// ----------------------- Grupos (JWT) - grupos do usuário -------------- //

apiRouter.use(Paths.Grupos._, gruposRouter);

// ----------------------- Certidões -------------------------------------- //

apiRouter.use(Paths.Certidoes._, certidaoRouter);

// ----------------------- Notificações (JWT) ----------------------------- //

apiRouter.use(Paths.Notificacoes._, notificacoesRouter);

// ----------------------- Push (vapid-key público; subscribe/unsubscribe JWT) //

apiRouter.use(Paths.Push._, pushRouter);

// ----------------------- Admin (JWT + role admin) ---------------------- //

apiRouter.use(Paths.Admin._, adminRouter);

// ----------------------- UserRouter ------------------------------------- //

const userRouter = Router();

userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

apiRouter.use(Paths.Users._, userRouter);

/******************************************************************************
                                Export
******************************************************************************/

export default apiRouter;
