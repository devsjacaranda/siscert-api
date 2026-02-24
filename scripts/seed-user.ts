/**
 * Seed: cria admin, superadmin e tipos de certidão padrão.
 * Uso: npm run seed (na pasta siscert-api, com DATABASE_URL no .env da raiz)
 *
 * Contas criadas:
 * - admin / 1234
 * - superadmin / 12345678
 */
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import bcrypt from 'bcrypt';
import prisma from '../src/lib/prisma';

const SALT_ROUNDS = 10;

const USUARIOS_SEED: Array<{ login: string; senha: string; nome: string; role: string }> = [
  { login: 'admin', senha: '1234', nome: 'Administrador', role: 'admin' },
  { login: 'superadmin', senha: '12345678', nome: 'Super Administrador', role: 'admin' },
];

const TIPOS_CERTIDAO_PADRAO = [
  'Receita Federal',
  'SEFAZ',
  'Prefeitura',
  'Trabalhista',
  'Falência e Concordata',
  'FGTS',
  'CGU',
];

async function seed(): Promise<void> {
  for (const u of USUARIOS_SEED) {
    const senhaHash = await bcrypt.hash(u.senha, SALT_ROUNDS);
    const existing = await prisma.user.findUnique({
      where: { login: u.login },
    });

    if (existing) {
      await prisma.user.update({
        where: { login: u.login },
        data: {
          senhaHash,
          nome: u.nome,
          role: u.role,
          status: 'ativo',
        },
      });
      // eslint-disable-next-line no-console
      console.log(`Usuário "${u.login}" atualizado (senha redefinida).`);
    } else {
      await prisma.user.create({
        data: {
          login: u.login,
          senhaHash,
          nome: u.nome,
          role: u.role,
          status: 'ativo',
        },
      });
      // eslint-disable-next-line no-console
      console.log(`Usuário "${u.login}" criado. Login: ${u.login} / Senha: ${u.senha}`);
    }
  }

  // Seed empresas padrão
  const EMPRESAS_PADRAO = [
    { slug: 'salviam', nome: 'Sallvian', ordem: 0, cor: '#3b82f6' },
    { slug: 'jacaranda', nome: 'Jacaranda', ordem: 1, cor: '#22c55e' },
  ];
  for (const emp of EMPRESAS_PADRAO) {
    await prisma.empresa.upsert({
      where: { slug: emp.slug },
      create: { slug: emp.slug, nome: emp.nome, ordem: emp.ordem, ativo: true, cor: emp.cor },
      update: { nome: emp.nome, ordem: emp.ordem, cor: emp.cor },
    });
  }
  // eslint-disable-next-line no-console
  console.log(`${EMPRESAS_PADRAO.length} empresas configuradas.`);

  // Seed tipos de certidão
  for (let i = 0; i < TIPOS_CERTIDAO_PADRAO.length; i++) {
    const nome = TIPOS_CERTIDAO_PADRAO[i];
    await prisma.tipoCertidao.upsert({
      where: { nome },
      create: { nome, ordem: i, ativo: true },
      update: {},
    });
  }
  // eslint-disable-next-line no-console
  console.log(`${TIPOS_CERTIDAO_PADRAO.length} tipos de certidão configurados.`);

  await prisma.$disconnect();
}

seed().catch((e: unknown) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
