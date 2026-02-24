import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import { jwtMiddleware } from '@src/middleware/jwt.middleware';
import { adminMiddleware } from '@src/middleware/admin.middleware';
import * as AdminController from '@src/controllers/admin.controller';

const adminRouter = Router();

adminRouter.use(jwtMiddleware);
adminRouter.use(adminMiddleware);

// Estatísticas do painel admin
adminRouter.get(Paths.Admin.Stats, AdminController.getAdminStats);

// Usuários
adminRouter.get(Paths.Admin.Usuarios, AdminController.listarUsuarios);
adminRouter.post(Paths.Admin.Usuarios, AdminController.criarUsuario);
adminRouter.put(Paths.Admin.UsuarioAprovar, AdminController.aprovarUsuario);
adminRouter.put(Paths.Admin.UsuarioBloquear, AdminController.bloquearUsuario);
adminRouter.put(Paths.Admin.UsuarioReativar, AdminController.reativarUsuario);
adminRouter.put(Paths.Admin.UsuarioGrupos, AdminController.setUsuarioGrupos);
adminRouter.put(Paths.Admin.UsuarioById, AdminController.atualizarUsuario);
adminRouter.delete(Paths.Admin.UsuarioById, AdminController.excluirUsuario);

// Grupos
adminRouter.get(Paths.Admin.Grupos, AdminController.listarGrupos);
adminRouter.get(Paths.Admin.GrupoById, AdminController.getGrupoById);
adminRouter.post(Paths.Admin.Grupos, AdminController.criarGrupo);
adminRouter.put(Paths.Admin.GrupoById, AdminController.atualizarGrupo);
adminRouter.delete(Paths.Admin.GrupoById, AdminController.excluirGrupo);
adminRouter.put(Paths.Admin.GrupoUsuarios, AdminController.setGrupoUsuarios);
adminRouter.put(Paths.Admin.GrupoEmpresas, AdminController.setGrupoEmpresas);

// Tipos de certidão
adminRouter.get(Paths.Admin.TiposCertidao, AdminController.listarTiposCertidao);
adminRouter.post(Paths.Admin.TiposCertidao, AdminController.criarTipoCertidao);
adminRouter.put(Paths.Admin.TipoCertidaoById, AdminController.atualizarTipoCertidao);
adminRouter.delete(Paths.Admin.TipoCertidaoById, AdminController.excluirTipoCertidao);

// Empresas (rotas mais específicas primeiro)
adminRouter.get(Paths.Admin.Empresas, AdminController.listarEmpresas);
adminRouter.post(Paths.Admin.Empresas, AdminController.criarEmpresa);
adminRouter.get(Paths.Admin.EmpresaById, AdminController.getEmpresaById);
adminRouter.put(Paths.Admin.EmpresaTipos, AdminController.setEmpresaTiposBloqueados);
adminRouter.put(Paths.Admin.EmpresaById, AdminController.atualizarEmpresa);
adminRouter.delete(Paths.Admin.EmpresaById, AdminController.excluirEmpresa);

export default adminRouter;
