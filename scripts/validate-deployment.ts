/**
 * Horizon CI/CD — Vercel Deployment Validation & Dry-Run Verifier
 * Validates vercel.json configuration, route rewrite integrity, serverless function entrypoints,
 * and built artifact readiness for zero-downtime production deployments.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface VercelRewrite {
  source: string;
  destination: string;
}

export interface VercelCron {
  path: string;
  schedule: string;
}

export interface VercelConfig {
  $schema?: string;
  buildCommand?: string;
  outputDirectory?: string;
  framework?: string;
  rewrites?: VercelRewrite[];
  crons?: VercelCron[];
}

export interface DeploymentValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  config?: VercelConfig;
}

export function validateVercelConfig(options: { verifyDist?: boolean } = {}): DeploymentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const root = process.cwd();
  const vercelJsonPath = resolve(root, 'vercel.json');

  if (!existsSync(vercelJsonPath)) {
    return {
      passed: false,
      errors: ['vercel.json file not found at repository root.'],
      warnings,
    };
  }

  let config: VercelConfig;
  try {
    const raw = readFileSync(vercelJsonPath, 'utf-8');
    config = JSON.parse(raw);
  } catch (err: any) {
    return {
      passed: false,
      errors: [`vercel.json is not valid JSON: ${err.message}`],
      warnings,
    };
  }

  // 1. Verify schema and basic settings
  if (!config.buildCommand) {
    errors.push("Missing 'buildCommand' in vercel.json");
  } else if (!config.buildCommand.includes('build')) {
    warnings.push(`Suspicious buildCommand '${config.buildCommand}' — expected a build command.`);
  }

  if (!config.outputDirectory) {
    errors.push("Missing 'outputDirectory' in vercel.json");
  }

  if (config.framework !== 'vite') {
    warnings.push(`Framework is set to '${config.framework}', expected 'vite'.`);
  }

  // 2. Verify rewrites
  if (!Array.isArray(config.rewrites) || config.rewrites.length === 0) {
    errors.push("vercel.json 'rewrites' must be a non-empty array");
  } else {
    const apiRewrite = config.rewrites.find((r) => r.source.includes('api'));
    if (!apiRewrite) {
      warnings.push("No explicit rewrite rule found for '/api/*' endpoints.");
    }
    const spaRewrite = config.rewrites.find((r) => r.destination === '/index.html' || r.destination.endsWith('index.html'));
    if (!spaRewrite) {
      warnings.push("No SPA catch-all rewrite rule found for '/index.html'.");
    }
  }

  // 3. Verify crons
  if (config.crons) {
    if (!Array.isArray(config.crons)) {
      errors.push("'crons' must be an array");
    } else {
      for (const cron of config.crons) {
        if (!cron.path || !cron.schedule) {
          errors.push(`Invalid cron definition: ${JSON.stringify(cron)}`);
        } else {
          const parts = cron.schedule.trim().split(/\s+/);
          if (parts.length !== 5) {
            errors.push(`Cron schedule '${cron.schedule}' must have exactly 5 fields.`);
          }
        }
      }
    }
  }

  // 4. Verify Serverless API Entrypoint
  const serverlessEntry = resolve(root, 'api/v1/[[...route]].ts');
  if (!existsSync(serverlessEntry)) {
    errors.push(`Serverless entrypoint file missing at: ${serverlessEntry}`);
  }

  // 5. Verify Frontend Application Entrypoints
  const webIndexHtml = resolve(root, 'apps/web/index.html');
  const webPackageJson = resolve(root, 'apps/web/package.json');
  const webViteConfig = resolve(root, 'apps/web/vite.config.ts');

  if (!existsSync(webIndexHtml)) errors.push(`Frontend index.html missing at: ${webIndexHtml}`);
  if (!existsSync(webPackageJson)) errors.push(`Frontend package.json missing at: ${webPackageJson}`);
  if (!existsSync(webViteConfig)) errors.push(`Frontend vite.config.ts missing at: ${webViteConfig}`);

  // 6. Verify Production Output Directory (if flag is passed or post-build)
  if (options.verifyDist && config.outputDirectory) {
    const distPath = resolve(root, config.outputDirectory);
    if (!existsSync(distPath)) {
      errors.push(`Build output directory does not exist: ${distPath}`);
    } else {
      const distIndexHtml = resolve(distPath, 'index.html');
      if (!existsSync(distIndexHtml)) {
        errors.push(`Compiled index.html not found in build output: ${distIndexHtml}`);
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

if (import.meta.main) {
  console.log('================================================================');
  console.log('🚀 Horizon CI/CD — Vercel Deployment Readiness & Dry-Run Audit');
  console.log('================================================================');

  const verifyDist = process.argv.includes('--verify-dist');
  const result = validateVercelConfig({ verifyDist });

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (!result.passed) {
    console.error('\n❌ Deployment Readiness Validation Failed:');
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('\n✅ Vercel Deployment Configuration is 100% Valid!');
  console.log(`  ✓ Build Command: ${result.config?.buildCommand}`);
  console.log(`  ✓ Output Directory: ${result.config?.outputDirectory}`);
  console.log(`  ✓ Framework: ${result.config?.framework}`);
  console.log(`  ✓ Rewrites: ${result.config?.rewrites?.length} rules validated`);
  console.log(`  ✓ Crons: ${result.config?.crons?.length} schedules active`);
  console.log(`  ✓ Serverless API entrypoint verified (api/v1/[[...route]].ts)`);
  console.log(`  ✓ Frontend Vite entrypoints verified (apps/web/index.html)\n`);
  process.exit(0);
}
