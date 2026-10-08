import React from 'react';
import { AuditTable } from '../components/audit/AuditTable';

export const AuditPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#FFF8F0]">
          Cryptographic Audit Trail
        </h1>
        <p className="text-xs text-[#A3ADC2] mt-0.5">
          Real-time incident event log anchored on-chain with cryptographic hash verification and tamper-evident timestamps.
        </p>
      </div>
      <AuditTable />
    </div>
  );
};
