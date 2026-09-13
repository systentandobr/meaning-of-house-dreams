#!/usr/bin/env node
/**
 * Security Audit Script — casa-dos-sonhos (frontend)
 *
 * Mesmo padrão do science-journal: roda no pre-commit via husky e pode ser
 * chamado manualmente com `pnpm run audit:security`.
 *
 * Uso: node scripts/security-audit.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const SRC_DIR = path.join(ROOT, 'src');
const ENV_FILES = ['.env', '.env.local', '.env.development', '.env.production'];

const LEAK_PATTERNS = [
  { pattern: /[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}/g, name: 'JWT-like token' },
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, name: 'OpenAI/Stripe Secret Key' },
  { pattern: /gsk_[a-zA-Z0-9]{20,}/g, name: 'Groq API Key' },
  { pattern: /AIza[0-9A-Za-z_-]{35}/g, name: 'Google API Key' },
  { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key ID' },
  { pattern: /ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{20,}/g, name: 'GitHub token' },
  { pattern: /\b\d{8,10}:[a-zA-Z0-9_-]{35}\b/g, name: 'Telegram bot token' },
  { pattern: /mongodb(\+srv)?:\/\/[^\s/:@]+:[^\s/@]+@/g, name: 'MongoDB URI com credencial' },
  { pattern: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g, name: 'Private key block' },
  { pattern: /VITE_[A-Z0-9_]*(API_KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*/g, name: 'VITE_* sensitive env var reference' },
  { pattern: /"x-api-key"\s*:\s*"[^"]{10,}"/gi, name: 'x-api-key header with value' },
  { pattern: /MCP_GUARD_SECRET\s*[:=]\s*["'][^"'\s]{8,}["']/g, name: 'MCP guard secret' },
];

const URL_PATTERN = /['"`](https?:\/\/[^'"`\s]+)['"`]/g;
const PUBLIC_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'localhost',
  '127.0.0.1',
];

const ALLOWED_DIST_EXTS = ['.js', '.css', '.html', '.json', '.map'];
const ALLOWED_SRC_EXTS = ['.ts', '.tsx', '.js', '.jsx'];
const STAGED_SCAN_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.env', '.md', '.cjs', '.toml', '.yaml', '.yml', ''];

const PLACEHOLDER_RE = /(sua-chave|seu-token|your-|exemplo|example|changeme|placeholder|xxx+|\$\{|\{\{)/i;

function walkDir(dir, exts, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) walkDir(fullPath, exts, files);
    else if (exts.includes(path.extname(entry))) files.push(fullPath);
  }
  return files;
}

function scanContent(content, filePath) {
  const results = [];
  for (const { pattern, name } of LEAK_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      const unique = [...new Set(matches)].filter((m) => !PLACEHOLDER_RE.test(m)).slice(0, 3);
      if (unique.length > 0) results.push({ pattern: name, matches: unique, file: filePath });
    }
  }
  return results;
}

function printFindings(results) {
  let count = 0;
  for (const r of results) {
    count += r.matches.length;
    console.log(`  📄 ${path.relative(ROOT, r.file)}`);
    for (const match of r.matches) {
      const truncated = match.length > 60 ? match.slice(0, 57) + '...' : match;
      console.log(`     \x1b[31m[${r.pattern}]\x1b[0m ${truncated}`);
    }
    console.log();
  }
  return count;
}

function auditDist() {
  console.log('=== Security Audit: Bundle ===\n');
  if (!fs.existsSync(DIST_DIR)) {
    console.log('⚠️  dist/ não encontrado. Execute pnpm build para auditá-lo.\n');
    return 0;
  }
  const files = walkDir(DIST_DIR, ALLOWED_DIST_EXTS);
  const findings = printFindings(files.flatMap((f) => scanContent(fs.readFileSync(f, 'utf-8'), f)));
  if (findings === 0) console.log('\x1b[32m✅ Nenhum vazamento no bundle.\x1b[0m\n');
  return findings;
}

function auditEnvFiles() {
  console.log('=== Security Audit: Environment Files ===\n');
  let findings = 0;
  for (const envFile of ENV_FILES) {
    const filePath = path.join(ROOT, envFile);
    if (!fs.existsSync(filePath)) continue;
    // .env files with real values must never be committed.
    let tracked = false;
    try {
      tracked = execSync(`git ls-files --error-unmatch ${envFile}`, { cwd: ROOT, stdio: 'pipe' }).toString().trim() !== '';
    } catch {}
    if (tracked) {
      findings++;
      console.log(`  \x1b[31m❌ ${envFile} está tracked pelo git — remova e use .env.example.\x1b[0m`);
    }
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^VITE_.*(API_KEY|SECRET|TOKEN|PASSWORD)\s*=\s*.+/i.test(line)) {
        if (line.trim().startsWith('#')) continue;
        if (/=\s*(sua-chave|seu-token|your-|exemplo|example|changeme|123456|''|""|\s*$)/i.test(line)) continue;
        findings++;
        console.log(`  \x1b[33m⚠️  ${envFile} linha ${i + 1}: ${line.trim().replace(/(=\s*)(.+)/, '$1***')}\x1b[0m`);
      }
    }
  }
  if (findings === 0) console.log('\x1b[32m✅ Nenhum .env sensível.\x1b[0m\n');
  return findings;
}

function auditSourceUrls() {
  console.log('=== Security Audit: Source URLs ===\n');
  const files = walkDir(SRC_DIR, ALLOWED_SRC_EXTS);
  let findings = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const m of content.matchAll(URL_PATTERN)) {
      try {
        const { hostname } = new URL(m[1]);
        if (PUBLIC_DOMAINS.includes(hostname) || hostname.endsWith('.localhost')) continue;
        findings++;
        console.log(`  \x1b[33m⚠️  ${path.relative(ROOT, file)}\x1b[0m`);
        console.log(`     URL: ${m[1]}`);
      } catch {}
    }
  }
  if (findings === 0) console.log('\x1b[32m✅ Nenhuma URL interna exposta.\x1b[0m\n');
  return findings;
}

function auditStagedFiles() {
  console.log('=== Security Audit: Staged Files ===\n');
  let staged = '';
  try {
    staged = execSync('git diff --cached --name-only --diff-filter=ACM', { cwd: ROOT }).toString();
  } catch {
    console.log('ℹ️  Fora de um repo git ou nada staged; pulando.\n');
    return 0;
  }
  const findings = [];
  for (const rel of staged.split('\n').filter(Boolean)) {
    const ext = path.extname(rel);
    const full = path.join(ROOT, rel);
    if (!STAGED_SCAN_EXTS.includes(ext) || !fs.existsSync(full) || !fs.statSync(full).isFile()) continue;
    if (rel.includes('security-audit.cjs')) continue;
    findings.push(...scanContent(fs.readFileSync(full, 'utf-8'), full));
  }
  const count = printFindings(findings);
  if (count === 0) console.log('\x1b[32m✅ Nenhum segredo nos arquivos staged.\x1b[0m\n');
  return count;
}

let exitCode = 0;
try {
  const staged = auditStagedFiles();
  const dist = auditDist();
  const env = auditEnvFiles();
  const urls = auditSourceUrls();
  const total = staged + dist + env;
  console.log('=== Security Audit: Summary ===\n');
  if (total === 0) {
    console.log('\x1b[32m✅ AUDITORIA CONCLUÍDA: Nenhum problema encontrado.\x1b[0m');
  } else {
    console.log(`\x1b[31m⚠️  AUDITORIA CONCLUÍDA: ${total} problema(s) crítico(s).\x1b[0m`);
    exitCode = 1;
  }
  if (urls > 0) {
    console.log(`\x1b[33m⚠️  ${urls} URL(s) encontrada(s); avaliar manualmente.\x1b[0m`);
  }
} catch (err) {
  console.error('Erro:', err.message);
  exitCode = 2;
}
process.exit(exitCode);
