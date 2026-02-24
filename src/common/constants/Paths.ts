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
} as const;

export const JetPaths = jetPaths(Paths);
export default Paths;
