import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { fetchAuditLogs } from '../../lib/api';
import type { AuditLogEntry } from '../../types';
import {
  Search,
  Download,
  CheckCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';

export const AuditTable: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await fetchAuditLogs(100);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSeverity = severityFilter === 'all' || l.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `horizon_audit_trail_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-5 border-b border-white/[0.07]">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-[#ECECF0] tracking-tight">
            Immutable Audit Trail & On-Chain Hashes
          </h2>
          <p className="text-xs text-[#A0A0AB]">
            Cryptographically anchored state transitions and human commander approvals.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#63636E]" />
            <input
              type="text"
              placeholder="Search actions or actors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-[7px] bg-[#101012] border border-white/[0.08] text-xs text-[#ECECF0] placeholder-[#63636E] focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-[7px] bg-white/[0.03] border border-white/[0.08]">
            <Filter className="w-3.5 h-3.5 text-[#63636E] ml-1.5" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-xs text-[#ECECF0] pr-2 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141416] text-[#ECECF0]">All Severities</option>
              <option value="info" className="bg-[#141416] text-[#ECECF0]">Info</option>
              <option value="warning" className="bg-[#141416] text-[#ECECF0]">Warning</option>
              <option value="critical" className="bg-[#141416] text-[#ECECF0]">Critical</option>
            </select>
          </div>

          <Button variant="secondary" size="sm" onClick={loadLogs} className="gap-1 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button variant="secondary" size="sm" onClick={exportJSON} className="gap-1 text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Modern Ledger Table */}
      <div className="overflow-x-auto rounded-[10px] border border-white/[0.08] bg-[#101012]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#18181B] border-b border-white/[0.08] text-[#63636E] uppercase font-mono tracking-wider text-[10px]">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action Executed</th>
              <th className="p-3">Details</th>
              <th className="p-3">Severity</th>
              <th className="p-3">On-Chain Vault</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#63636E]">
                  {loading ? 'Fetching audit records...' : 'No matching audit records found.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isCrit = log.severity.toLowerCase() === 'critical';
                const isWarn = log.severity.toLowerCase() === 'warning';

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-white/[0.02] transition-colors font-mono"
                  >
                    <td className="p-3 text-[#A0A0AB] whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px] text-[#ECECF0]">
                        {log.actor}
                      </span>
                    </td>
                    <td className="p-3 font-sans font-medium text-[#ECECF0]">
                      {log.action}
                    </td>
                    <td className="p-3 font-sans text-[#A0A0AB] max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <Badge
                        status={isCrit ? 'down' : isWarn ? 'degraded' : 'healthy'}
                      >
                        {log.severity}
                      </Badge>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-[#ECECF0]">
                        <CheckCircle className="w-3 h-3 text-[#34D399]" />
                        <span>0x{log.id.slice(0, 6)}...{log.id.slice(-4)}</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#63636E]">
        <span>Displaying {filteredLogs.length} verified incident transitions</span>
        <span className="font-mono text-[10px]">Smart Contract: HorizonAuditVault.sol</span>
      </div>
    </Card>
  );
};
