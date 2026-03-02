import bcrypt from 'bcrypt';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import prisma from '@src/lib/prisma';
import { RouteError } from '@src/common/utils/route-errors';
import AuthRepo from '@src/repos/AuthRepo';
import GrupoRepo from '@src/repos/grupo-repo';
import TipoCertidaoRepo from '@src/repos/tipo-certidao-repo';
import EmpresaRepo from '@src/repos/empresa-repo';
import type {
  UsuarioCreateBody,
  UsuarioUpdateBody,
  GrupoCreateBody,
  GrupoUpdateBody,
  GrupoUsuariosBody,
  GrupoEmpresasBody,
  TipoCertidaoCreateBody,
  TipoCertidaoUpdateBody,
  EmpresaCreateBody,
  EmpresaUpdateBody,
} from '@src/models/admin.model';

const SALT_ROUNDS = 10;

/** Retorna a role do usuário (para checagem superadmin vs admin). */
async function getRequesterRole(userId: number): Promise<string> {
  const user = await AuthRepo.findById(userId);
  return user?.role ?? 'usuario';
}

/** Só superadmin pode gerenciar usuários com role admin ou superadmin. */
function requireSuperAdminForAdminTarget(requesterRole: string, targetRole: string): void {
  if (targetRole === 'admin' || targetRole === 'superadmin') {
    if (requesterRole !== 'superadmin') {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Apenas superadministrador pode gerenciar contas de administrador');
    }
  }
}

export type GrupoUsuarioApi = { grupoId: number; acesso: 'comum' | 'visualizador' };

export interface UsuarioApi {
  id: number;
  login: string;
  nome: string | null;
  role: string;
  status: string;
  approvedAt: string | null;
  grupos: GrupoUsuarioApi[];
  createdAt: string;
}

function userToApi(user: {
  id: number;
  login: string;
  nome: string | null;
  role: string;
  status: string;
  approvedAt: Date | null;
  createdAt: Date;
  grupos?: Array<{ grupoId: number; acesso: string }>;
}): UsuarioApi {
  return {
    id: user.id,
    login: user.login,
    nome: user.nome,
    role: user.role,
    status: user.status,
    approvedAt: user.approvedAt?.toISOString() ?? null,
    grupos: (user.grupos ?? []).map((g) => ({
      grupoId: g.grupoId,
      acesso: g.acesso === 'visualizador' ? 'visualizador' : 'comum',
    })),
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listarUsuarios(): Promise<UsuarioApi[]> {
  const users = await AuthRepo.findMany();
  return users.map((u) => userToApi(u));
}

export async function aprovarUsuario(userId: number, adminId: number): Promise<UsuarioApi | null> {
  const [target, requesterRole] = await Promise.all([
    AuthRepo.findById(userId),
    getRequesterRole(adminId),
  ]);
  if (target) requireSuperAdminForAdminTarget(requesterRole, target.role);
  const user = await AuthRepo.updateStatus(userId, 'ativo', adminId);
  if (!user) return null;
  const grupos = await AuthRepo.getUserGruposComAcesso(userId);
  return userToApi({
    ...user,
    grupos: grupos.map((g) => ({ grupoId: g.grupoId, acesso: g.acesso })),
  });
}

export async function bloquearUsuario(userId: number, requesterId: number): Promise<UsuarioApi | null> {
  if (userId === requesterId) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Não é permitido bloquear a própria conta');
  }
  const target = await AuthRepo.findById(userId);
  if (target) requireSuperAdminForAdminTarget(await getRequesterRole(requesterId), target.role);
  const user = await AuthRepo.updateStatus(userId, 'bloqueado');
  if (!user) return null;
  const grupos = await AuthRepo.getUserGruposComAcesso(userId);
  return userToApi({
    ...user,
    grupos: grupos.map((g) => ({ grupoId: g.grupoId, acesso: g.acesso })),
  });
}

export async function reativarUsuario(userId: number, adminId: number): Promise<UsuarioApi | null> {
  const [target, requesterRole] = await Promise.all([
    AuthRepo.findById(userId),
    getRequesterRole(adminId),
  ]);
  if (target) requireSuperAdminForAdminTarget(requesterRole, target.role);
  const user = await AuthRepo.updateStatus(userId, 'ativo', adminId);
  if (!user) return null;
  const grupos = await AuthRepo.getUserGruposComAcesso(userId);
  return userToApi({
    ...user,
    grupos: grupos.map((g) => ({ grupoId: g.grupoId, acesso: g.acesso })),
  });
}

export async function criarUsuario(body: UsuarioCreateBody, requesterId: number): Promise<UsuarioApi> {
  const requesterRole = await getRequesterRole(requesterId);
  const role = body.role ?? 'usuario';
  if (requesterRole !== 'superadmin' && role !== 'usuario') {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Apenas superadministrador pode criar contas de administrador');
  }
  const existente = await AuthRepo.findByLogin(body.login);
  if (existente) {
    throw new RouteError(HttpStatusCodes.CONFLICT, 'Login já em uso');
  }
  const senhaHash = await bcrypt.hash(body.senha, SALT_ROUNDS);
  const user = await AuthRepo.create({
    login: body.login,
    senhaHash,
    nome: body.nome,
    role,
    status: body.status,
  });
  return userToApi({
    ...user,
    grupos: [],
  });
}

export async function atualizarUsuario(
  userId: number,
  body: UsuarioUpdateBody,
  requesterId: number
): Promise<UsuarioApi | null> {
  const existente = await AuthRepo.findById(userId);
  if (!existente) return null;
  const requesterRole = await getRequesterRole(requesterId);
  requireSuperAdminForAdminTarget(requesterRole, existente.role);
  if (userId === requesterId && body.role !== undefined && body.role !== existente.role) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Não é permitido alterar a própria role');
  }
  if (body.role !== undefined && requesterRole !== 'superadmin') {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Apenas superadministrador pode alterar a role de um usuário');
  }
  const data: { nome?: string | null; login?: string; senhaHash?: string; role?: string } = {};
  if (body.nome !== undefined) data.nome = body.nome;
  if (body.login != null) {
    const outro = await AuthRepo.findByLogin(body.login);
    if (outro && outro.id !== userId) {
      throw new RouteError(HttpStatusCodes.CONFLICT, 'Login já em uso');
    }
    data.login = body.login;
  }
  if (body.senha != null) {
    data.senhaHash = await bcrypt.hash(body.senha, SALT_ROUNDS);
  }
  if (body.role !== undefined) data.role = body.role;
  const user = await AuthRepo.updateUser(userId, data);
  if (!user) return null;
  const grupos = await AuthRepo.getUserGruposComAcesso(userId);
  return userToApi({
    ...user,
    grupos: grupos.map((g) => ({ grupoId: g.grupoId, acesso: g.acesso })),
  });
}

export async function setUsuarioGrupos(
  userId: number,
  grupos: Array<{ grupoId: number; acesso?: 'comum' | 'visualizador' }>,
  requesterId: number
): Promise<void> {
  const [target, requesterRole] = await Promise.all([
    AuthRepo.findById(userId),
    getRequesterRole(requesterId),
  ]);
  if (target) requireSuperAdminForAdminTarget(requesterRole, target.role);
  await AuthRepo.setUserGrupos(userId, grupos);
}

export async function excluirUsuario(userId: number, requesterId: number): Promise<boolean> {
  if (userId === requesterId) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Não é permitido excluir a própria conta');
  }
  const user = await AuthRepo.findById(userId);
  if (!user) return false;
  if (user.role === 'superadmin') {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Não é permitido excluir superadministradores');
  }
  if (user.role === 'admin') {
    const requesterRole = await getRequesterRole(requesterId);
    if (requesterRole !== 'superadmin') {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Apenas superadministrador pode excluir contas de administrador');
    }
  }
  return AuthRepo.deleteUser(userId);
}

export async function listarGrupos() {
  return GrupoRepo.findMany();
}

export async function criarGrupo(body: GrupoCreateBody) {
  return GrupoRepo.create(body.nome);
}

export async function atualizarGrupo(id: number, body: GrupoUpdateBody) {
  return GrupoRepo.update(id, body.nome);
}

export async function excluirGrupo(id: number): Promise<boolean> {
  return GrupoRepo.remove(id);
}

export async function setGrupoUsuarios(grupoId: number, body: GrupoUsuariosBody): Promise<void> {
  await GrupoRepo.setUsersInGrupo(grupoId, body.usuarios);
}

export async function setGrupoEmpresas(grupoId: number, body: GrupoEmpresasBody): Promise<void> {
  await GrupoRepo.setEmpresasInGrupo(grupoId, body.empresaIds);
}

export interface GrupoDetalheApi {
  id: number;
  nome: string;
  createdAt: string;
  usuarios: Array<{ id: number; login: string; nome: string | null; acesso: 'comum' | 'visualizador' }>;
  empresaIds: number[];
}

export async function getGrupoById(id: number): Promise<GrupoDetalheApi | null> {
  const grupo = await GrupoRepo.findById(id);
  if (!grupo) return null;
  const [usuariosComAcesso, empresaIds] = await Promise.all([
    GrupoRepo.getUsersInGrupoComAcesso(id),
    GrupoRepo.getEmpresasByGrupoId(id),
  ]);
  const userIds = usuariosComAcesso.map((u) => u.userId);
  const users =
    userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, login: true, nome: true },
        })
      : [];
  const userMap = new Map(users.map((u) => [u.id, u]));
  const usuarios = usuariosComAcesso.map((u) => {
    const usr = userMap.get(u.userId);
    return {
      id: u.userId,
      login: usr?.login ?? '',
      nome: usr?.nome ?? null,
      acesso: u.acesso,
    };
  });
  return {
    id: grupo.id,
    nome: grupo.nome,
    createdAt: grupo.createdAt,
    usuarios,
    empresaIds,
  };
}

export async function listarTiposCertidao(apenasAtivos = false) {
  return TipoCertidaoRepo.findMany(apenasAtivos);
}

export async function criarTipoCertidao(body: TipoCertidaoCreateBody) {
  return TipoCertidaoRepo.create({ nome: body.nome, ordem: body.ordem });
}

export async function atualizarTipoCertidao(id: number, body: TipoCertidaoUpdateBody) {
  return TipoCertidaoRepo.update(id, body);
}

export async function excluirTipoCertidao(id: number): Promise<boolean> {
  return TipoCertidaoRepo.remove(id);
}

export interface EmpresaDetalheApi {
  id: number;
  slug: string;
  nome: string;
  cor: string | null;
  ordem: number;
  ativo: boolean;
  tipoIdsBloqueados: number[];
}

export async function listarEmpresas(apenasAtivos = false): Promise<EmpresaDetalheApi[]> {
  const rows = await EmpresaRepo.findMany(apenasAtivos);
  const ids = rows.map((r) => r.id);
  const bloqueados =
    ids.length > 0 ? await EmpresaRepo.getTiposBloqueadosMap(ids) : new Map<number, number[]>();
  return rows.map((r) => ({
    ...r,
    tipoIdsBloqueados: bloqueados.get(r.id) ?? [],
  }));
}

export async function getEmpresaById(id: number): Promise<EmpresaDetalheApi | null> {
  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: { tiposBloqueados: { select: { tipoCertidaoId: true } } },
  });
  if (!empresa) return null;
  return {
    id: empresa.id,
    slug: empresa.slug,
    nome: empresa.nome,
    cor: empresa.cor,
    ordem: empresa.ordem,
    ativo: empresa.ativo,
    tipoIdsBloqueados: empresa.tiposBloqueados.map((t) => t.tipoCertidaoId),
  };
}

export async function criarEmpresa(body: EmpresaCreateBody) {
  return EmpresaRepo.create(body.nome, body.ordem, body.cor ?? null);
}

export async function atualizarEmpresa(id: number, body: EmpresaUpdateBody) {
  return EmpresaRepo.update(id, body);
}

export async function setEmpresaTiposBloqueados(empresaId: number, tipoIds: number[]): Promise<void> {
  await EmpresaRepo.setTiposBloqueados(empresaId, tipoIds);
}

export async function excluirEmpresa(id: number): Promise<boolean> {
  return EmpresaRepo.remove(id);
}

export interface AdminStats {
  totalUsuarios: number;
  usuariosPendentes: number;
  usuariosAtivos: number;
  usuariosBloqueados: number;
  totalCertidoes: number;
  certidoesAtivas: number;
  certidoesArquivadas: number;
  certidoesLixeira: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [users, certidoes] = await Promise.all([
    prisma.user.findMany({ select: { status: true } }),
    prisma.certidao.findMany({ select: { status: true } }),
  ]);
  const usuariosPendentes = users.filter((u) => u.status === 'pendente').length;
  const usuariosAtivos = users.filter((u) => u.status === 'ativo').length;
  const usuariosBloqueados = users.filter((u) => u.status === 'bloqueado').length;
  const certidoesAtivas = certidoes.filter((c) => c.status === 'ativa').length;
  const certidoesArquivadas = certidoes.filter((c) => c.status === 'arquivada').length;
  const certidoesLixeira = certidoes.filter((c) => c.status === 'lixeira').length;
  return {
    totalUsuarios: users.length,
    usuariosPendentes,
    usuariosAtivos,
    usuariosBloqueados,
    totalCertidoes: certidoes.length,
    certidoesAtivas,
    certidoesArquivadas,
    certidoesLixeira,
  };
}

export default {
  getAdminStats,
  listarUsuarios,
  aprovarUsuario,
  bloquearUsuario,
  criarUsuario,
  atualizarUsuario,
  setUsuarioGrupos,
  excluirUsuario,
  reativarUsuario,
  listarGrupos,
  criarGrupo,
  atualizarGrupo,
  excluirGrupo,
  setGrupoUsuarios,
  setGrupoEmpresas,
  getGrupoById,
  listarTiposCertidao,
  criarTipoCertidao,
  atualizarTipoCertidao,
  excluirTipoCertidao,
  getEmpresaById,
  listarEmpresas,
  criarEmpresa,
  atualizarEmpresa,
  setEmpresaTiposBloqueados,
  excluirEmpresa,
};
