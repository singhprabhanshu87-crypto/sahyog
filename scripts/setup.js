#!/usr/bin/env node
/**
 * First-time setup — install deps, verify cloud .env, seed Atlas.
 * No Docker. No interactive prompts. Uses server/.env (Atlas + Upstash).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureEnvFiles, validateCloudEnv, maskUrl } from './lib/env-check.js';

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

function main() {
  console.log('\n🌱 Sahyog — setup\n');

  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < 20) {
    console.error('Node.js 20+ is required. Current:', process.versions.node);
    process.exit(1);
  }

  log('Installing dependencies…');
  run('npm', ['install'], root);
  run('npm', ['install'], serverDir);
  run('npm', ['install'], clientDir);

  const { serverEnv } = ensureEnvFiles({ serverDir, clientDir, log });

  if (!existsSync(serverEnv)) {
    console.error('\n❌ server/.env not found. Copy server/.env.example and add your cloud URLs.\n');
    process.exit(1);
  }

  const { env, errors } = validateCloudEnv(serverEnv);
  if (errors.length) {
    console.error('\n❌ server/.env configuration:\n');
    errors.forEach((e) => console.error(`   • ${e}`));
    console.error('\n   Use MongoDB Atlas + Upstash URLs in server/.env (no local Docker).\n');
    process.exit(1);
  }

  console.log('\n── Cloud services (from server/.env) ──');
  console.log(`   MongoDB: ${maskUrl(env.MONGODB_URI)}`);
  console.log(`   Redis:   ${maskUrl(env.REDIS_URL)} (TLS=${env.REDIS_TLS ?? 'false'})`);

  log('Seeding database on Atlas…');
  try {
    run('npm', ['run', 'seed'], serverDir);
  } catch {
    console.log('\n⚠ Seed failed — check Atlas network access (allow your IP) and credentials.\n');
    process.exit(1);
  }

  console.log('\n✅ Setup complete!\n');
  console.log('  Start the app:  npm run dev');
  console.log('  Open:           http://localhost:5173');
  console.log('  Login:          pmu@sahyog.demo (OTP in API terminal)\n');
}

main();
