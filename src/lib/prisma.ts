/* eslint-disable no-process-env */
import path from 'path';
import dotenv from 'dotenv';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

/** Raiz do projeto: a partir de src/lib sobe 2 níveis; de dist/src/lib sobe 3. */
function findProjectRoot(): string {
  const dir = __dirname;
  // dist/src/lib -> sobe 3; src/lib -> sobe 2
  if (dir.includes(path.sep + 'dist' + path.sep)) {
    return path.join(dir, '..', '..', '..');
  }
  return path.join(dir, '..', '..');
}

function getDbConfig(): { host: string; user: string; password: string; database: string; port: number } {
  let url: string | undefined = process.env.DATABASE_URL;
  const roots = [findProjectRoot(), process.cwd()];
  const envPaths: string[] = [];
  for (const root of roots) {
    envPaths.push(
      path.join(root, '.env'),
      path.join(root, 'config/.env.production'),
      path.join(root, 'config/.env.development')
    );
  }
  if (!url || !url.startsWith('mysql://')) {
    for (const envPath of envPaths) {
      try {
        dotenv.config({ path: envPath });
        url = process.env.DATABASE_URL;
        if (url?.startsWith('mysql://')) break;
      } catch {
        // ignore
      }
    }
  }
  if (!url || !url.startsWith('mysql://')) {
    throw new Error(
      'DATABASE_URL must be set and use mysql:// scheme. Define it in .env or config/.env.production in the project root.'
    );
  }
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1).replace(/\?.*$/, '') || '',
  };
}

const config = getDbConfig();
const adapter = new PrismaMariaDb({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  connectionLimit: 10,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
