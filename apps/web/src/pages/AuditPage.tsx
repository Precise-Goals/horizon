import React from 'react';
import { AuditTable } from '../components/audit/AuditTable';

export const AuditPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black uppercase tracking-tight">Cryptographic Audit Trail</h1>
      <AuditTable />
    </div>
  );
};
