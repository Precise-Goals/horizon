import { describe, expect, it } from 'bun:test';
import { auditGitignoreHygiene, auditEnvExampleHygiene, auditGitTrackedEnvFiles } from './secrets-hygiene';

describe('CI/CD Secrets Hygiene & Security Audit Suite', () => {
  it('validates .gitignore contains rules protecting .env secrets', () => {
    const errors = auditGitignoreHygiene();
    expect(errors).toHaveLength(0);
  });

  it('validates root .env.example hygiene with zero leaked credentials', () => {
    const { errors } = auditEnvExampleHygiene();
    expect(errors).toHaveLength(0);
  });

  it('ensures no live .env or secret files are tracked in git index', () => {
    const errors = auditGitTrackedEnvFiles();
    expect(errors).toHaveLength(0);
  });
});
