#!/usr/bin/env node
/**
 * Run API, worker, and client together.
 * Usage: npm run dev
 */
import { spawnSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const serverDir = join(root, 'server');
const clientDir = join(root, 'client');

function tryDocker() {
  const result = spawnSync('docker', ['compose', 'up', '-d'], {
    cwd: root,
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });
  if (result.status === 0) {
    console.log('▸ MongoDB + Redis started via Docker\n');
  }
}

function main() {
  if (!existsSync(join(serverDir, 'node_modules'))) {
    console.error('Dependencies not installed. Run: npm run setup\n');
    process.exit(1);
  }

  if (!existsSync(join(serverDir, '.env'))) {
    console.error('Missing server/.env. Run: npm run setup\n');
    process.exit(1);
  }

  console.log('\n🚀 Sahyog — starting dev servers\n');
  tryDocker();

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
    {
      cwd: root,
      stdio: 'inherit',
      shell: true,
    },
  );

  child.on('exit', (code) => process.exit(code ?? 0));

  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
}

main();
