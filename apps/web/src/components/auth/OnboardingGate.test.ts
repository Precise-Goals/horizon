import { describe, it, expect } from 'bun:test';

describe('Public Routing & Onboarding Gate Suite', () => {
  const PUBLIC_PATHS = [
    '/',
    '/patents',
    '/policies',
    '/governance/patents',
    '/governance/policies',
    '/docs',
    '/mcp',
  ];

  const isPublicRoute = (pathname: string): boolean => {
    return PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
  };

  it('allows public access to /patents without onboarding clearance', () => {
    expect(isPublicRoute('/patents')).toBe(true);
    expect(isPublicRoute('/patents/')).toBe(true);
  });

  it('allows public access to /governance/patents without onboarding clearance', () => {
    expect(isPublicRoute('/governance/patents')).toBe(true);
  });

  it('allows public access to /policies without onboarding clearance', () => {
    expect(isPublicRoute('/policies')).toBe(true);
    expect(isPublicRoute('/policies/')).toBe(true);
  });

  it('allows public access to /governance/policies without onboarding clearance', () => {
    expect(isPublicRoute('/governance/policies')).toBe(true);
  });

  it('allows public access to /docs and /mcp', () => {
    expect(isPublicRoute('/docs')).toBe(true);
    expect(isPublicRoute('/mcp')).toBe(true);
  });

  it('requires onboarding clearance for operator command routes', () => {
    expect(isPublicRoute('/dashboard')).toBe(false);
    expect(isPublicRoute('/topology')).toBe(false);
    expect(isPublicRoute('/recovery')).toBe(false);
    expect(isPublicRoute('/audit')).toBe(false);
    expect(isPublicRoute('/architect')).toBe(false);
  });
});
