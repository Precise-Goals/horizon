import { describe, expect, it } from 'bun:test';
import { getPlaybookForType, PLAYBOOKS } from './playbooks';
import { PlaybookStepSchema } from '../../packages/shared/src/index';

describe('Playbooks Engine (API Logic)', () => {
  it('returns valid steps for database target type', () => {
    const steps = getPlaybookForType('database');
    expect(steps.length).toBe(4);
    expect(steps[0].action).toBe('drain_connection_pool');
    expect(steps[1].action).toBe('promote_replica_cutover');
    expect(steps[1].risk).toBe('high');

    for (const step of steps) {
      expect(() => PlaybookStepSchema.parse(step)).not.toThrow();
    }
  });

  it('returns valid steps for cache target type', () => {
    const steps = getPlaybookForType('cache');
    expect(steps.length).toBe(2);
    expect(steps[0].action).toBe('flush_expired_keys');
    expect(steps[1].action).toBe('warm_cache_snapshot');

    for (const step of steps) {
      expect(() => PlaybookStepSchema.parse(step)).not.toThrow();
    }
  });

  it('returns default service restart steps for application target type', () => {
    const steps = getPlaybookForType('application');
    expect(steps.length).toBe(3);
    expect(steps[0].action).toBe('drain_traffic');
    expect(steps[1].action).toBe('rolling_restart');
    expect(steps[2].action).toBe('verify_readiness');

    for (const step of steps) {
      expect(() => PlaybookStepSchema.parse(step)).not.toThrow();
    }
  });

  it('ensures PLAYBOOKS map contains unique step IDs per playbook', () => {
    for (const pb of Object.values(PLAYBOOKS)) {
      const ids = pb.steps.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    }
  });
});
