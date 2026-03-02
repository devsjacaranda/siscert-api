#!/usr/bin/env node
'use strict';

const path = require('path');

// Executado de dentro de dist/ - sobe para raiz do projeto
process.chdir(path.join(__dirname, '..'));

// Valores padrão para Debian/servidor sem .env (evita erro jet-env)
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'change-this-jwt-secret-in-production';

// Carrega .env (config ou raiz) se existir
const configPath = path.join(process.cwd(), 'config/.env.production');
const rootPath = path.join(process.cwd(), '.env');
require('dotenv').config({ path: configPath });
require('dotenv').config({ path: rootPath });

// Registra @src sem depender de package.json (útil em deploy sem package.json)
require('module-alias').addAlias('@src', path.join(__dirname, 'src'));

require('./src/main');
