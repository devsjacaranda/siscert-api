#!/usr/bin/env node
'use strict';

const path = require('path');

// Valores padrão para servidor sem .env (evita erro jet-env)
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'change-this-jwt-secret-in-production';

require('dotenv').config({ path: path.join(__dirname, 'config/.env.production') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Registra @src sem depender de package.json (útil em deploy sem package.json)
require('module-alias').addAlias('@src', path.join(__dirname, 'dist', 'src'));

require(path.join(__dirname, 'dist', 'src', 'main'));
