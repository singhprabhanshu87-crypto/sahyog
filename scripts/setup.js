#!/usr/bin/env node
/**
 * First-time setup after cloning the repo.
 * Usage: npm run setup
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { promptEnvKeys } from './prompt-env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const serverDir = join(root, 'server');
const clientDir = join(root, 'client');

function log(msg) {
  console.log(`\n▸ ${msg}`);
}

function run(cmd, args, cwd = root) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

function tryRun(cmd, args, cwd = root) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status === 0;
}

function ensureEnvFile() {
  const example = join(serverDir, '.env.example');
  const envPath = join(serverDir, '.env');

  if (!existsSync(example)) {
    log('Warning: server/.env.example not found — skip env setup');
    return;
  }

  if (!existsSync(envPath)) {
    copyFileSync(example, envPath);
    log('Created server/.env from .env.example');
  }
}

async function main() {
  console.log('\n🌱 Sahyog — setup\n');

  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < 20) {
    console.error('Node.js 20+ is required. Current:', process.versions.node);
    process.exit(1);
  }

  log('Installing root dependencies…');
  run('npm', ['install'], root);

  log('Installing server dependencies…');
  run('npm', ['install'], serverDir);

  log('Installing client dependencies…');
  run('npm', ['install'], clientDir);

  ensureEnvFile();
  await promptEnvKeys();

  log('Starting MongoDB + Redis (Docker)…');
  const dockerOk = tryRun('docker', ['compose', 'up', '-d'], root);
  if (!dockerOk) {
    console.log(
      '\n⚠ Docker not available or compose failed.',
      'Start MongoDB and Redis manually, or install Docker Desktop.',
      '\n  Mongo: mongodb://localhost:27017/sahyog',
      '\n  Redis: redis://localhost:6379',
    );
  } else {
    log('Waiting for databases to be ready…');
    spawnSync('node', ['-e', 'setTimeout(() => {}, 5000)'], { stdio: 'inherit', shell: true });
  }

  log('Seeding database…');
  const seedOk = tryRun('npm', ['run', 'seed'], serverDir);
  if (!seedOk) {
    console.log(
      '\n⚠ Seed failed — databases may not be running yet.',
      'After Mongo is up, run: npm run seed',
    );
  }

  console.log('\n✅ Setup complete!\n');
  console.log('  Start the app:     npm run dev');
  console.log('  Re-enter API keys: npm run setup:env');
  console.log('  Open:              http://localhost:5173');
  console.log('  Login:             pmu@sahyog.demo (OTP in server console)\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
