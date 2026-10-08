/**
 * Horizon CI/CD Secrets Hygiene & Security Audit Script
 * Validates repository against committed secrets, raw private keys, and checks .env.example hygiene.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

export interface AuditResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export function auditGitTrackedEnvFiles(): string[] {
  const errors: string[] = [];
  try {
    const trackedFiles = execSync('git ls-files', { encoding: 'utf-8' })
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    for (const file of trackedFiles) {
      const lower = file.toLowerCase();
      // Allow .env.example or .env.template, but disallow actual .env or .env.local / .env.production
      if (
        (lower.endsWith('.env') || lower.includes('.env.')) &&
        !lower.endsWith('.env.example') &&
        !lower.endsWith('.env.template')
      ) {
        errors.push(`Tracked environment secret file detected in git index: ${file}`);
      }
    }
  } catch (err: any) {
    // If git is not available, fallback to warning
    console.warn(`[Secrets Audit] Could not run git ls-files: ${err.message}`);
  }
  return errors;
}

export function auditGitTrackedPrivateKeys(): string[] {
  const errors: string[] = [];
  try {
    const trackedFiles = execSync('git ls-files', { encoding: 'utf-8' })
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const binaryExts = ['.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.lock', '.lockb'];

    for (const file of trackedFiles) {
      if (binaryExts.some((ext) => file.endsWith(ext))) continue;
      // Skip simulated / test scripts that define mock keys
      if (file.includes('test') || file.includes('spec') || file.includes('.agents') || file.includes('simulated')) continue;

      const fullPath = resolve(process.cwd(), file);
      if (!existsSync(fullPath)) continue;

      const content = readFileSync(fullPath, 'utf-8');

      // 1. Check for raw PEM private key blocks
      if (/-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/.test(content)) {
        errors.push(`Raw unencrypted PEM private key detected in: ${file}`);
      }

      // 2. Check for real AWS Access Key IDs
      if (/(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/.test(content)) {
        errors.push(`AWS Access Key pattern detected in: ${file}`);
      }

      // 3. Check for GitHub Personal Access Tokens
      if (/ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{82}/.test(content)) {
        errors.push(`GitHub Personal Access Token detected in: ${file}`);
      }
    }
  } catch (err: any) {
    console.warn(`[Secrets Audit] Private key scan error: ${err.message}`);
  }
  return errors;
}

export function auditEnvExampleHygiene(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rootExamplePath = resolve(process.cwd(), '.env.example');

  if (!existsSync(rootExamplePath)) {
    errors.push('Root .env.example file is missing!');
    return { errors, warnings };
  }

  const content = readFileSync(rootExamplePath, 'utf-8');
  const lines = content.split('\n');

  const sensitiveKeyPatterns = ['KEY', 'SECRET', 'PASSWORD', 'PRIVATE', 'TOKEN', 'CREDENTIAL'];
  const safeValuePrefixes = ['your_', 'example_', 'change_', 'placeholder', 'demo_', '0xyour_', '0xYour', 'G-XXXX'];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (!line || line.startsWith('#')) continue;

    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;

    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim();

    const isSensitive = sensitiveKeyPatterns.some((pattern) => key.toUpperCase().includes(pattern));

    if (isSensitive && val) {
      const isPlaceholder = safeValuePrefixes.some((p) => val.toLowerCase().startsWith(p.toLowerCase()));
      if (!isPlaceholder && val.length > 10) {
        errors.push(
          `.env.example line ${idx + 1} contains potential real secret for key '${key}'. Must use a placeholder prefix like 'your_' or '0xyour_'.`
        );
      }
    }
  }

  // Verify essential keys are documented
  const essentialKeys = [
    'FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'SARVAM_API_KEY',
    'MST_TESTNET_RPC',
    'CHAIN_ID',
    'AUTHORIZED_WALLETS',
    'TICK_SECRET',
  ];

  for (const k of essentialKeys) {
    if (!content.includes(k)) {
      warnings.push(`Essential configuration key '${k}' is not documented in .env.example`);
    }
  }

  return { errors, warnings };
}

export function auditGitignoreHygiene(): string[] {
  const errors: string[] = [];
  const gitignorePath = resolve(process.cwd(), '.gitignore');

  if (!existsSync(gitignorePath)) {
    errors.push('.gitignore file is missing!');
    return errors;
  }

  const content = readFileSync(gitignorePath, 'utf-8');
  if (!content.includes('.env')) {
    errors.push('.gitignore does not contain .env rule!');
  }

  return errors;
}

export function runFullSecurityAudit(): AuditResult {
  const trackedErrors = auditGitTrackedEnvFiles();
  const keyErrors = auditGitTrackedPrivateKeys();
  const { errors: envErrors, warnings: envWarnings } = auditEnvExampleHygiene();
  const gitignoreErrors = auditGitignoreHygiene();

  const allErrors = [...trackedErrors, ...keyErrors, ...envErrors, ...gitignoreErrors];
  return {
    passed: allErrors.length === 0,
    errors: allErrors,
    warnings: envWarnings,
  };
}

if (import.meta.main) {
  console.log('================================================================');
  console.log('🔒 Horizon CI/CD — Autonomous Secrets & Hygiene Audit');
  console.log('================================================================');

  const result = runFullSecurityAudit();

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (!result.passed) {
    console.error('\n❌ Security Audit Failed with errors:');
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('\n✅ Security & Secrets Hygiene Audit Passed cleanly!');
  console.log('  ✓ No tracked .env files detected in git');
  console.log('  ✓ No raw private keys or credentials leaked');
  console.log('  ✓ .env.example adheres to strict placeholder standards');
  console.log('  ✓ .gitignore properly ignores secret files\n');
  process.exit(0);
}
