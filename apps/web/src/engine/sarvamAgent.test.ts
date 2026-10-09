import { describe, it, expect } from 'bun:test';
import { sarvamAgent } from './sarvamAgent';
import { dockerBridge } from './dockerBridge';

describe('Sarvam AI SRE Copilot & Domain Guardrail Suite', () => {
  it('accepts technical in-domain questions (AIOps, SRE, workflows, systems, topologies)', () => {
    expect(sarvamAgent.isDomainQuery('How does Kahn topological sort prevent outages?')).toBe(true);
    expect(sarvamAgent.isDomainQuery('Explain PostgreSQL connection pool exhaustion and blast radius')).toBe(true);
    expect(sarvamAgent.isDomainQuery('What are the best practices for Kubernetes ingress failover?')).toBe(true);
    expect(sarvamAgent.isDomainQuery('How do autonomous recovery playbooks orchestrate microservices?')).toBe(true);
    expect(sarvamAgent.isDomainQuery('Describe Redis cache warming before routing traffic')).toBe(true);
  });

  it('rejects out-of-domain inquiries (cooking, weather, sports, politics, trivia)', () => {
    expect(sarvamAgent.isDomainQuery('How do I bake a chocolate cake recipe?')).toBe(false);
    expect(sarvamAgent.isDomainQuery('What is the weather forecast today?')).toBe(false);
    expect(sarvamAgent.isDomainQuery('Who won the football game yesterday?')).toBe(false);
    expect(sarvamAgent.isDomainQuery('Tell me a funny joke about cats')).toBe(false);
    expect(sarvamAgent.isDomainQuery('Who is the president of France?')).toBe(false);
  });

  it('askSreAdvisor returns polite technical refusal for out-of-domain questions', async () => {
    const refusal = await sarvamAgent.askSreAdvisor('Can you give me a recipe for pizza?');
    expect(refusal).toContain('specialized exclusively in Horizon AIOps');
    expect(refusal).toContain('distributed systems architecture');
    expect(refusal.endsWith('.')).toBe(true);
  });

  it('formatSreResponse ensures response starts and concludes properly without mid-sentence cut-offs', () => {
    const longText =
      'In high-scale distributed systems, database health probes must pass before caches warm up. When Postgres recovers, Redis warms read models efficiently. Subsequently, application workers start processing jobs without encountering connection drops. Finally, edge API gateways accept public ingress requests. Any failure in this sequence triggers autonomous rollback to previous stable snapshot.';

    const formatted = sarvamAgent.formatSreResponse(longText);
    expect(formatted.length).toBeLessThanOrEqual(530);
    expect(/[.!?]$/.test(formatted)).toBe(true);
    // Starts with a capitalized word
    expect(formatted[0]).toBe(formatted[0].toUpperCase());
  });

  it('dockerBridge safely defaults to IN_MEMORY_SIMULATOR without connection errors', () => {
    const status = dockerBridge.getStatus();
    expect(status.mode).toBe('IN_MEMORY_SIMULATOR');
    expect(status.connected).toBe(false);
  });
});
