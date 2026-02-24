/* eslint-disable no-process-env */
import path from 'path';
import dotenv from 'dotenv';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

function getDbConfig(): { host: string; user: string; password: string; database: string; port: number } {
  let url: string | undefined = process.env.DATABASE_URL;
  if (!url || !url.startsWith('mysql://')) {
    try {
      dotenv.config({ path: path.join(process.cwd(), '.env') });
      url = process.env.DATABASE_URL;
    } catch {
      // ignore
    }
  }
  if (!url || !url.startsWith('mysql://')) {
    throw new Error(
      'DATABASE_URL must be set and use mysql:// scheme. Define it in config/.env.development or in the root .env'
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
