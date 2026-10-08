import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Search } from 'lucide-react';

export const AuditTable = () => {
  const [filter, setFilter] = useState('All');
  
  const logs = [
    { id: '1', time: '2026-10-08 10:42:01', actor: 'System', action: 'Automated snapshot created', severity: 'Info', hash: '0x8f...3a' },
    { id: '2', time: '2026-10-08 10:35:12', actor: 'Admin (0x4a...9c)', action: 'Security policy updated', severity: 'Warning', hash: '0x2b...1f' },
    { id: '3', time: '2026-10-08 09:15:44', actor: 'Auto-Scaler', action: 'Scaled up compute instances', severity: 'Info', hash: '0x9c...4e' },
    { id: '4', time: '2026-10-08 08:00:00', actor: 'System', action: 'Daily backup verified', severity: 'Info', hash: '0x1a...5d' },
    { id: '5', time: '2026-10-07 23:14:05', actor: 'Postgres Monitor', action: 'DB failover triggered', severity: 'Critical', hash: '0x5e...2b' },
  ];

  const filteredLogs = filter === 'All' ? logs : logs.filter(l => l.severity === filter);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 border-b-2 border-[#1A1A1A] pb-4">
        <h2 className="text-xl font-black uppercase">Audit Trail</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="w-full pl-9 pr-4 py-2 border-2 border-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-2 focus:ring-[#0047AB] bg-white font-bold text-sm uppercase"
          >
            <option value="All">All Severities</option>
            <option value="Info">Info</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-[3px] border-[#1A1A1A] bg-[#FFF8F0]">
              <th className="p-3 font-black uppercase text-sm">Timestamp</th>
              <th className="p-3 font-black uppercase text-sm">Actor</th>
              <th className="p-3 font-black uppercase text-sm">Action</th>
              <th className="p-3 font-black uppercase text-sm">Severity</th>
              <th className="p-3 font-black uppercase text-sm">Hash Verification</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-[#1A1A1A] hover:bg-gray-50 transition-colors">
                <td className="p-3 text-sm font-mono">{log.time}</td>
                <td className="p-3 text-sm font-bold">{log.actor}</td>
                <td className="p-3 text-sm">{log.action}</td>
                <td className="p-3">
                  <Badge status={log.severity === 'Critical' ? 'down' : (log.severity === 'Warning' ? 'degraded' : 'healthy')}>
                    {log.severity}
                  </Badge>
                </td>
                <td className="p-3 text-xs font-mono bg-gray-100 border-l border-[#1A1A1A]">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                    {log.hash}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" size="sm">Export CSV</Button>
      </div>
    </Card>
  );
};
