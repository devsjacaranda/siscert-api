import jetPaths from 'jet-paths';

const Paths = {
  _: '/api',
  Auth: {
    _: '/auth',
    Cadastro: '/cadastro',
    Login: '/login',
    TrocarSenha: '/trocar-senha',
  },
  Notificacoes: {
    _: '/notificacoes',
    Config: '/config',
  },
  Push: {
    _: '/push',
    VapidKey: '/vapid-key',
    Subscribe: '/subscribe',
    Unsubscribe: '/unsubscribe',
  },
  TiposCertidao: {
    _: '/tipos-certidao',
  },
  Empresas: {
    _: '/empresas',
  },
  Grupos: {
    _: '/grupos',
  },
  Certidoes: {
    _: '/certidoes',
    List: '/',
    ById: '/:id',
    Arquivar: '/:id/arquivar',
    Restaurar: '/:id/restaurar',
    Duplicar: '/:id/duplicar',
  },
  Users: {
    _: '/users',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
  Admin: {
    _: '/admin',
    Stats: '/stats',
    Usuarios: '/usuarios',
    UsuarioById: '/usuarios/:id',
    UsuarioAprovar: '/usuarios/:id/aprovar',
    UsuarioBloquear: '/usuarios/:id/bloquear',
    UsuarioReativar: '/usuarios/:id/reativar',
    UsuarioGrupos: '/usuarios/:id/grupos',
    Grupos: '/grupos',
    GrupoById: '/grupos/:id',
    GrupoUsuarios: '/grupos/:id/usuarios',
    GrupoEmpresas: '/grupos/:id/empresas',
    TiposCertidao: '/tipos-certidao',
    TipoCertidaoById: '/tipos-certidao/:id',
    Empresas: '/empresas',
    EmpresaById: '/empresas/:id',
    EmpresaTipos: '/empresas/:id/tipos-bloqueados',
  },
} as const;

export const JetPaths = jetPaths(Paths);
export default Paths;
