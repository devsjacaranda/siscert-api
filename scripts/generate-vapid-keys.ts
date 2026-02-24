/**
 * Gera chaves VAPID para Web Push.
 * Uso: npx ts-node scripts/generate-vapid-keys.ts
 *
 * Adicione as chaves em config/.env.development e config/.env.production:
 * VAPID_PUBLIC_KEY=...
 * VAPID_PRIVATE_KEY=...
 */

/* eslint-disable no-console */
import webPush from 'web-push';

const keys = webPush.generateVAPIDKeys();
console.log('\nAdicione ao .env:\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log('\n');
