/**
 * Seed: cria usuário admin / senha 123 para login.
 * Uso: npm run seed (na pasta siscert-api, com DATABASE_URL no .env da raiz)
 */
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import bcrypt from 'bcrypt';
import prisma from '../src/lib/prisma';

const SALT_ROUNDS = 10;
const LOGIN = 'admin';
const SENHA = '1234';
const NOME = 'Administrador';

async function seed(): Promise<void> {
  const senhaHash = await bcrypt.hash(SENHA, SALT_ROUNDS);

  const existing = await prisma.user.findUnique({
    where: { login: LOGIN },
  });

  if (existing) {
    await prisma.user.update({
      where: { login: LOGIN },
      data: { senhaHash, nome: NOME },
    });
    // eslint-disable-next-line no-console
    console.log(`Usuário "${LOGIN}" atualizado (senha redefinida para ${SENHA}).`);
  } else {
    await prisma.user.create({
      data: {
        login: LOGIN,
        senhaHash,
        nome: NOME,
      },
    });
    // eslint-disable-next-line no-console
    console.log(`Usuário "${LOGIN}" criado. Login: ${LOGIN} / Senha: ${SENHA}`);
  }

  await prisma.$disconnect();
}

seed().catch((e: unknown) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
