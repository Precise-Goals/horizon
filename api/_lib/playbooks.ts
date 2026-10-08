/**
 * Horizon Declarative Playbook Library
 * Pure data definitions mapping service types to discrete recovery steps.
 * No raw shell strings; strictly structured actions.
 */
import type { Playbook, PlaybookStep } from '../../packages/shared/src/index';

export const PLAYBOOKS: Record<string, Playbook> = {
  database_failover: {
    id: 'database_failover',
    name: 'Primary Database Failover & Replica Promotion',
    target_type: 'database',
    steps: [
      {
        id: 1,
        title: 'Isolate Impaired Primary Database',
        action: 'drain_connection_pool',
        risk: 'low',
        status: 'pending',
        log: '',
      },
      {
        id: 2,
        title: 'Promote Standby Read Replica to Primary',
        action: 'promote_replica_cutover',
        risk: 'high',
        status: 'pending',
        log: '',
      },
      {
        id: 3,
        title: 'Invalidate Connected Cache Keys',
        action: 'flush_stale_cache',
        risk: 'low',
        status: 'pending',
        log: '',
      },
      {
        id: 4,
        title: 'Update Service Connection Pool VIP',
        action: 'repoint_virtual_ip',
        risk: 'low',
        status: 'pending',
        log: '',
      },
    ],
  },
  service_restart: {
    id: 'service_restart',
    name: 'Rolling Pod Restart & Health Verification',
    target_type: 'application',
    steps: [
      {
        id: 1,
        title: 'Drain Ingress Traffic from Impaired Pods',
        action: 'drain_traffic',
        risk: 'low',
        status: 'pending',
        log: '',
      },
      {
        id: 2,
        title: 'Trigger Rolling Deployment Restart',
        action: 'rolling_restart',
        risk: 'low',
        status: 'pending',
        log: '',
      },
      {
        id: 3,
        title: 'Verify Application Readiness Probes',
        action: 'verify_readiness',
        risk: 'low',
        status: 'pending',
        log: '',
      },
    ],
  },
  cache_purge: {
    id: 'cache_purge',
    name: 'Cache Cluster Invalidation & Resynchronization',
    target_type: 'cache',
    steps: [
      {
        id: 1,
        title: 'Flush Expired and Corrupted Cache Keys',
        action: 'flush_expired_keys',
        risk: 'low',
        status: 'pending',
        log: '',
      },
      {
        id: 2,
        title: 'Warm Up Hot Session Cache from Primary DB',
        action: 'warm_cache_snapshot',
        risk: 'low',
        status: 'pending',
        log: '',
      },
    ],
  },
};

export const getPlaybookForType = (type: string): PlaybookStep[] => {
  if (type === 'database') return JSON.parse(JSON.stringify(PLAYBOOKS.database_failover.steps));
  if (type === 'cache') return JSON.parse(JSON.stringify(PLAYBOOKS.cache_purge.steps));
  return JSON.parse(JSON.stringify(PLAYBOOKS.service_restart.steps));
};
