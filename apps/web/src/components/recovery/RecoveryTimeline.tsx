import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { clusterState } from '../../engine/state';
import {
  RotateCcw,
  Terminal,
  ShieldAlert,
  Clock,
  KeyRound,
  Check,
  X,
  Play,
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  service: string;
  action: string;
  isHighRisk?: boolean;
  status: 'completed' | 'running' | 'waiting_approval' | 'pending';
  log: string;
}

export const RecoveryTimeline: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(1); // 0-indexed, step 1 is approval gate
  const [isApproved, setIsApproved] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const initialSteps: Step[] = [
    {
      id: 1,
      title: 'Isolate Impaired Primary Database',
      service: 'db-primary (PostgreSQL)',
      action: 'Drain connection pool & revoke write lock',
      status: currentStepIndex > 0 ? 'completed' : currentStepIndex === 0 ? 'running' : 'pending',
      log: '[00:01.2] Connection pool drained: 142 connections safely terminated. Write locks removed.',
    },
    {
      id: 2,
      title: 'Human Commander Approval Gate',
      service: 'Horizon Orchestrator',
      action: 'High-risk automated failover verification',
      isHighRisk: true,
      status: isApproved
        ? 'completed'
        : currentStepIndex === 1
        ? 'waiting_approval'
        : currentStepIndex > 1
        ? 'completed'
        : 'pending',
      log: isApproved
        ? '[00:03.4] Cryptographic approval signature validated: Commander (0x71C...49A). Resuming execution.'
        : '[00:02.0] Execution paused at gate: High-risk database failover requires explicit approval.',
    },
    {
      id: 3,
      title: 'Promote Standby Read Replica',
      service: 'db-replica (PostgreSQL)',
      action: 'Execute promote_replica_to_master.sh',
      status: currentStepIndex > 2 ? 'completed' : currentStepIndex === 2 ? 'running' : 'pending',
      log: '[00:04.8] Replication lag: 0 bytes. Replica promoted to Master. Virtual IP re-anchored.',
    },
    {
      id: 4,
      title: 'Invalidate Stale Redis Cache Keys',
      service: 'redis-cache (Cluster)',
      action: 'Purge session cache & update connection strings',
      status: currentStepIndex > 3 ? 'completed' : currentStepIndex === 3 ? 'running' : 'pending',
      log: '[00:06.1] Flushed stale session keys. Redis ping: PONG (1.4ms latency).',
    },
    {
      id: 5,
      title: 'Rolling Restart API Gateway',
      service: 'api-gateway (FastAPI)',
      action: 'Zero-downtime traffic shift to healthy replicas',
      status: isCompleted ? 'completed' : currentStepIndex === 4 ? 'running' : 'pending',
      log: '[00:08.5] Health checks passed: 10/10 pods reporting 200 OK. Traffic restored.',
    },
  ];

  const handleApprove = async () => {
    setIsApproved(true);
    await clusterState.approveGate();
    setCurrentStepIndex(2);
  };

  const handleNextStep = () => {
    if (currentStepIndex < 4) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    clusterState.resetRecovery();
    setCurrentStepIndex(0);
    setIsApproved(false);
    setIsCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1E6BFF]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#FFF8F0] tracking-tight">
                Autonomous Recovery Orchestrator
              </h2>
              <p className="text-xs text-[#A3ADC2]">
                Incident Plan #INC-8921 &bull; Strategy: Topological Bottom-Up Recovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge
              status={isCompleted ? 'healthy' : isApproved ? 'recovering' : 'warning'}
              pulse={!isCompleted}
            >
              {isCompleted ? 'Recovery Complete' : isApproved ? 'Executing Plan' : 'Approval Required'}
            </Badge>

            <Button variant="secondary" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </Button>
          </div>
        </div>

        {/* Vertical Stepper Timeline */}
        <div className="mt-8 space-y-6 relative before:absolute before:inset-0 before:left-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/40 before:via-white/10 before:to-transparent">
          {initialSteps.map((step, idx) => {
            const isCurrent = currentStepIndex === idx && !isCompleted;
            const isDone = (currentStepIndex > idx || isCompleted) && (step.id !== 2 || isApproved);
            const isWaiting = step.status === 'waiting_approval';

            return (
              <div key={step.id} className="relative flex items-start gap-5 pl-1">
                {/* Step Circle Indicator */}
                <div
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border text-xs font-mono font-bold transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-blue-500/25 text-[#FFF8F0] border-blue-400 shadow-lg shadow-blue-500/30 scale-110 animate-pulse'
                      : isWaiting
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20'
                      : 'bg-[#0D121D] text-[#6E7A94] border-white/10'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : isWaiting ? (
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Details Glass Card */}
                <div
                  className={`flex-1 p-4 rounded-xl border backdrop-blur-xl transition-all duration-200 ${
                    isCurrent || isWaiting
                      ? 'bg-white/[0.05] border-blue-500/40 shadow-xl shadow-black/50'
                      : isDone
                      ? 'bg-white/[0.02] border-white/[0.06] opacity-90'
                      : 'bg-white/[0.01] border-white/[0.04] opacity-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#FFF8F0]">
                        {step.title}
                      </span>
                      {step.isHighRisk && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          HIGH-RISK GATE
                        </span>
                      )}
                    </div>
                    <Badge
                      status={
                        isDone
                          ? 'healthy'
                          : isWaiting
                          ? 'warning'
                          : isCurrent
                          ? 'recovering'
                          : 'pending'
                      }
                    >
                      {isDone ? 'Completed' : isWaiting ? 'Awaiting Signature' : isCurrent ? 'Running' : 'Queued'}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#A3ADC2] mb-2">{step.action}</p>

                  {/* Terminal Execution Log */}
                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.06] font-mono text-[11px] text-[#A3ADC2] flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{step.log}</span>
                  </div>

                  {/* Interactive Approval Gate Modal Box */}
                  {isWaiting && !isApproved && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
                      <div className="flex items-center gap-2 mb-2">
                        <KeyRound className="w-4 h-4 text-amber-300" />
                        <span className="text-xs font-bold text-amber-200">
                          Human Commander Verification Required
                        </span>
                      </div>
                      <p className="text-xs text-[#E2D7CB] mb-3">
                        Promoting a database replica alters DNS pointers and terminates remaining sessions on the primary instance. Please authorize to proceed.
                      </p>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={handleApprove}
                          className="gap-1.5 text-xs font-semibold"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Authorize Failover</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleReset}
                          className="gap-1.5 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Abort Playbook</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#A3ADC2]">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Topological dependency sequence guaranteed (Postgres &rarr; Redis &rarr; Gateway).</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNextStep}
            disabled={isCompleted || (currentStepIndex === 1 && !isApproved)}
            className="gap-1.5 text-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'All Steps Finished' : 'Advance Next Playbook Step'}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
