import { describe, expect, it } from 'bun:test';
import { validateVercelConfig } from './validate-deployment';

describe('CI/CD Vercel Deployment Readiness Validator', () => {
  it('validates vercel.json structure and required properties', () => {
    const result = validateVercelConfig();
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.buildCommand).toBe('bun run --cwd apps/web build');
    expect(result.config?.outputDirectory).toBe('apps/web/dist');
    expect(result.config?.framework).toBe('vite');
  });

  it('validates rewrites and edge serverless routes', () => {
    const result = validateVercelConfig();
    expect(result.config?.rewrites).toBeDefined();
    expect(result.config?.rewrites?.length).toBeGreaterThan(0);
  });
});
