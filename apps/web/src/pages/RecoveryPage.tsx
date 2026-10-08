import React from 'react';
import { RecoveryTimeline } from '../components/recovery/RecoveryTimeline';

export const RecoveryPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black uppercase tracking-tight">Recovery Orchestrator</h1>
      <RecoveryTimeline />
    </div>
  );
};
