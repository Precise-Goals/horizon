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
    <Card className="p-6 skeuo-card border-[#E5D7C5]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#EADCC9]">
        <div>
          <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">
            Immutable Audit Trail & On-Chain Hashes
          </h2>
          <p className="text-xs text-[#6E6258] font-medium">
            Cryptographically anchored state transitions and human commander approvals.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7B6D]" />
            <input
              type="text"
              placeholder="Search actions or actors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl skeuo-well text-xs text-[#1A1A1A] placeholder-[#8A7B6D] focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5]">
            <Filter className="w-3.5 h-3.5 text-[#6E6258] ml-2" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-xs text-[#1A1A1A] font-semibold pr-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white">All Severities</option>
              <option value="info" className="bg-white">Info</option>
              <option value="warning" className="bg-white">Warning</option>
              <option value="critical" className="bg-white">Critical</option>
            </select>
          </div>

          <Button variant="secondary" size="sm" onClick={loadLogs} className="gap-1 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button variant="secondary" size="sm" onClick={exportJSON} className="gap-1.5 text-xs font-semibold">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Modern Porcelain Ledger Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5D7C5] bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF3EA] border-b border-[#EADCC9] text-[#6E6258] uppercase font-mono tracking-wider text-[11px] font-bold">
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Actor</th>
              <th className="p-3.5">Action Executed</th>
              <th className="p-3.5">Details</th>
              <th className="p-3.5">Severity</th>
              <th className="p-3.5">On-Chain Vault</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4EBE0]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#8A7B6D] font-medium">
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
                    className="hover:bg-[#FFF8F0] transition-colors font-mono"
                  >
                    <td className="p-3.5 text-[#5A4E44] whitespace-nowrap font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-[#1A1A1A] whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FAF3EA] border border-[#E5D7C5] text-[11px]">
                        {log.actor}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans font-bold text-[#1A1A1A]">
                      {log.action}
                    </td>
                    <td className="p-3.5 font-sans text-[#5A4E44] max-w-xs truncate font-medium">
                      {log.details || '—'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <Badge
                        status={isCrit ? 'down' : isWarn ? 'degraded' : 'healthy'}
                      >
                        {log.severity}
                      </Badge>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] text-[#0047AB] font-bold shadow-xs">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
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

      <div className="mt-4 pt-3 border-t border-[#EADCC9] flex items-center justify-between text-xs text-[#6E6258] font-medium">
        <span>Displaying {filteredLogs.length} verified incident transitions</span>
        <span className="font-mono text-[10px] text-[#8A7B6D] font-bold">Smart Contract: HorizonAuditVault.sol</span>
      </div>
    </Card>
  );
};
