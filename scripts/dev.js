#!/usr/bin/env node
/**
 * Start API + worker + client. Uses cloud Mongo/Redis from server/.env — no Docker.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnvFile, maskUrl } from './lib/env-check.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const serverDir = join(root, 'server');

function main() {
  if (!existsSync(join(serverDir, 'node_modules'))) {
    console.error('Dependencies not installed. Run: npm run setup\n');
    process.exit(1);
  }

  const serverEnv = join(serverDir, '.env');
  if (!existsSync(serverEnv)) {
    console.error('Missing server/.env — copy server/.env.example and add Atlas + Upstash URLs.\n');
    process.exit(1);
  }

  const env = parseEnvFile(serverEnv);

  console.log('\n🚀 Sahyog — starting dev servers\n');
  console.log(`   MongoDB: ${maskUrl(env.MONGODB_URI)}`);
  console.log(`   Redis:   ${maskUrl(env.REDIS_URL)}\n`);

  const concurrently = join(
    root,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'concurrently.cmd' : 'concurrently',
  );

  const names = 'api,worker,client';
  const colors = 'blue,magenta,green';
  const commands = [
    'npm run dev:api --prefix server',
    'npm run dev:worker --prefix server',
    'npm run dev --prefix client',
  ].join('" "');

  const child = spawn(
    `"${concurrently}" -n ${names} -c ${colors} "${commands}"`,
    [],
    { cwd: root, stdio: 'inherit', shell: true },
  );

  child.on('exit', (code) => process.exit(code ?? 0));
  process.on('SIGINT', () => child.kill('SIGINT'));
}

main();
