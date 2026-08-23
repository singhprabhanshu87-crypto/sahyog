#!/usr/bin/env node
/**
 * Interactive prompts for API keys and writes them into server/.env
 */
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = join(__dirname, '..', 'server');
const envPath = join(serverDir, '.env');

function setEnvVar(env, key, value) {
  const line = `${key}=${value}`;
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(env)) {
    return env.replace(regex, line);
  }
  return `${env.trimEnd()}\n${line}\n`;
}

function isEmpty(value) {
  return !value || value.trim() === '';
}

async function ask(rl, question, { defaultValue = '', secret = false } = {}) {
  const hint = defaultValue ? ` [${defaultValue}]` : '';
  const answer = await rl.question(`${question}${hint}: `);
  const trimmed = answer.trim();
  if (isEmpty(trimmed)) return defaultValue;
  return trimmed;
}

export async function promptEnvKeys({ force = false } = {}) {
  if (!existsSync(envPath)) {
    const example = join(serverDir, '.env.example');
    if (!existsSync(example)) {
      console.error('server/.env.example not found');
      return;
    }
    const { copyFileSync } = await import('node:fs');
    copyFileSync(example, envPath);
  }

  let env = readFileSync(envPath, 'utf8');

  // Auto-generate JWT secrets
  if (env.includes('change-me-access-secret') || env.includes('change-me-refresh-secret')) {
    env = setEnvVar(env, 'JWT_ACCESS_SECRET', randomBytes(32).toString('hex'));
    env = setEnvVar(env, 'JWT_REFRESH_SECRET', randomBytes(32).toString('hex'));
  }

  const hasOpenRouter = /^OPENROUTER_API_KEY=.+$/m.test(env) && !/^OPENROUTER_API_KEY=\s*$/m.test(env);

  if (hasOpenRouter && !force) {
    console.log('\n▸ server/.env already has OPENROUTER_API_KEY — skipping API prompts');
    console.log('  Re-run with: node scripts/prompt-env.js --force\n');
    writeFileSync(envPath, env);
    return;
  }

  console.log('\n── API keys & providers ──────────────────────────────────');
  console.log('Press Enter to skip optional keys. Sahyog runs without them');
  console.log('(AI falls back to human review, media uses dev stubs).\n');

  const rl = createInterface({ input, output });

  try {
    const openRouterKey = await ask(rl, 'OpenRouter API key (required for AI triage/categorization)', {
      secret: true,
    });
    if (!isEmpty(openRouterKey)) {
      env = setEnvVar(env, 'OPENROUTER_API_KEY', openRouterKey);
      env = setEnvVar(env, 'OPENROUTER_SITE_URL', 'http://localhost:5173');

      const model = await ask(rl, 'Default LLM model (OpenRouter model ID)', {
        defaultValue: 'openai/gpt-4o-mini',
      });
      env = setEnvVar(env, 'AI_MODEL_TRIAGE', model);
      env = setEnvVar(env, 'AI_MODEL_CATEGORIZE', model);
      env = setEnvVar(env, 'AI_MODEL_SCOPE_DRAFT', model);
      env = setEnvVar(env, 'AI_MODEL_CAPABILITY_EXTRACT', model);
      env = setEnvVar(env, 'AI_MODEL_SUMMARIZE', model);
    } else {
      console.log('  ⚠ No OpenRouter key — triage/categorization will queue for human review.');
    }

    console.log('\nEmbeddings: local stub works for dev (no key). Use openai or jina for production.');
    const embeddingProvider = await ask(rl, 'Embedding provider (local | openai | jina)', {
      defaultValue: 'local',
    });
    env = setEnvVar(env, 'EMBEDDING_PROVIDER', embeddingProvider || 'local');

    if (embeddingProvider === 'openai') {
      const openaiKey = await ask(rl, 'OpenAI API key (embeddings)', { secret: true });
      if (!isEmpty(openaiKey)) env = setEnvVar(env, 'OPENAI_API_KEY', openaiKey);
    } else if (embeddingProvider === 'jina') {
      const jinaKey = await ask(rl, 'Jina API key (embeddings)', { secret: true });
      if (!isEmpty(jinaKey)) env = setEnvVar(env, 'JINA_API_KEY', jinaKey);
    }

    console.log('\nOptional: Cloudinary for photo/video uploads (skip for local dev).');
    const cloudName = await ask(rl, 'Cloudinary cloud name');
    if (!isEmpty(cloudName)) {
      env = setEnvVar(env, 'CLOUDINARY_CLOUD_NAME', cloudName);
      const cloudKey = await ask(rl, 'Cloudinary API key', { secret: true });
      const cloudSecret = await ask(rl, 'Cloudinary API secret', { secret: true });
      if (!isEmpty(cloudKey)) env = setEnvVar(env, 'CLOUDINARY_API_KEY', cloudKey);
      if (!isEmpty(cloudSecret)) env = setEnvVar(env, 'CLOUDINARY_API_SECRET', cloudSecret);
    }

    console.log('\nOptional: language/speech provider.');
    const langProvider = await ask(rl, 'Language provider (disabled | openai | bhashini)', {
      defaultValue: 'disabled',
    });
    env = setEnvVar(env, 'LANGUAGE_PROVIDER', langProvider || 'disabled');

    if (langProvider === 'openai') {
      const openaiKey = await ask(rl, 'OpenAI API key (Whisper + translation)', { secret: true });
      if (!isEmpty(openaiKey)) env = setEnvVar(env, 'OPENAI_API_KEY', openaiKey);
    } else if (langProvider === 'bhashini') {
      const bhashiniKey = await ask(rl, 'Bhashini API key', { secret: true });
      const bhashiniUser = await ask(rl, 'Bhashini user ID');
      if (!isEmpty(bhashiniKey)) env = setEnvVar(env, 'BHASHINI_API_KEY', bhashiniKey);
      if (!isEmpty(bhashiniUser)) env = setEnvVar(env, 'BHASHINI_USER_ID', bhashiniUser);
    }
  } finally {
    rl.close();
  }

  writeFileSync(envPath, env);
  console.log('\n✓ Saved to server/.env\n');
}

const isDirectRun = process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/prompt-env.js');
if (isDirectRun) {
  const force = process.argv.includes('--force');
  promptEnvKeys({ force }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
