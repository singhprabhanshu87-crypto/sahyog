import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function parseEnvFile(envPath) {
  if (!existsSync(envPath)) return {};
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return vars;
}

export function maskUrl(url = '') {
  try {
    const parsed = new URL(url.replace(/^redis:\/\//, 'http://').replace(/^mongodb(\+srv)?:\/\//, 'http://'));
    if (parsed.password) parsed.password = '****';
    return parsed.hostname ? `${parsed.protocol}//${parsed.username ? `${parsed.username}:****@` : ''}${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}${parsed.pathname}` : url;
  } catch {
    return url.replace(/:([^:@/]+)@/, ':****@');
  }
}

export function ensureEnvFiles({ serverDir, clientDir, log }) {
  const serverExample = join(serverDir, '.env.example');
  const serverEnv = join(serverDir, '.env');
  const clientExample = join(clientDir, '.env.example');
  const clientEnv = join(clientDir, '.env');

  if (!existsSync(serverEnv) && existsSync(serverExample)) {
    copyFileSync(serverExample, serverEnv);
    log('Created server/.env from .env.example — add your Atlas + Upstash URLs');
  }

  if (!existsSync(clientEnv) && existsSync(clientExample)) {
    copyFileSync(clientExample, clientEnv);
    log('Created client/.env from .env.example');
  }

  return { serverEnv, clientEnv };
}

export function validateCloudEnv(serverEnvPath) {
  const env = parseEnvFile(serverEnvPath);
  const errors = [];

  if (!env.MONGODB_URI) {
    errors.push('MONGODB_URI is missing in server/.env');
  } else if (env.MONGODB_URI.includes('localhost') || env.MONGODB_URI.includes('127.0.0.1')) {
    errors.push('MONGODB_URI points to localhost — use your MongoDB Atlas connection string');
  }

  if (!env.REDIS_URL) {
    errors.push('REDIS_URL is missing in server/.env');
  } else if (env.REDIS_URL.includes('localhost') || env.REDIS_URL.includes('127.0.0.1')) {
    errors.push('REDIS_URL points to localhost — use your Upstash Redis URL');
  }

  if (env.REDIS_URL?.includes('upstash.io') && env.REDIS_TLS !== 'true') {
    errors.push('REDIS_TLS must be true for Upstash (set REDIS_TLS=true in server/.env)');
  }

  return { env, errors };
}
