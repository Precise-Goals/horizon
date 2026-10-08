import React from 'react';
import { RecoveryTimeline } from '../components/recovery/RecoveryTimeline';

export const RecoveryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#FFF8F0]">
          Autonomous Recovery Orchestrator
        </h1>
        <p className="text-xs text-[#A3ADC2] mt-0.5">
          Deterministic execution of recovery playbooks in topological dependency order with mandatory human approval gates for critical infrastructure.
        </p>
      </div>
      <RecoveryTimeline />
    </div>
  );
};
