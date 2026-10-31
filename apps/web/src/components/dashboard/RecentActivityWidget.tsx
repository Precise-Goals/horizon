import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { fetchAuditLogs } from '../../lib/api';
import type { AuditLogEntry } from '../../types';
import { ShieldCheck, Terminal, User, Bot, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '../../lib/utils';

const actorIcon: Record<string, React.ElementType> = {
  system: Terminal,
  SYSTEM: Terminal,
  human: User,
  HUMAN: User,
  llm_agent: Bot,
  LLM_AGENT: Bot,
};

export const RecentActivityWidget: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadLogs = async () => {
      try {
        const data = await fetchAuditLogs(6);
        if (isMounted) setLogs(data);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadLogs();
    const interval = setInterval(loadLogs, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Card className="p-6 sm:p-7 col-span-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[rgba(26,26,26,0.08)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A] tracking-tight">
                Incident Triage Stream
              </h3>
              <p className="text-xs text-[#666666]">
                Cryptographically hashed audit ledger
              </p>
            </div>
          </div>
          <span className="horizon-badge text-[11px] text-[#0F8E52] bg-[#EBF7EE] border-[#0F8E52]/25">
            <span className="skeuo-led skeuo-led-healthy animate-pulse" />
            LIVE FEED
          </span>
        </div>

        {/* Timeline Stream */}
        <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[rgba(26,26,26,0.1)]">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#777777]">
              {loading ? 'Streaming audit trail...' : 'No incident logs recorded yet.'}
            </div>
          ) : (
            logs.map((log) => {
              const actorKey = (log.actor || 'system').toLowerCase();
              const Icon = actorIcon[actorKey] || actorIcon[log.actor] || Terminal;
              const isCrit = log.severity === 'critical';
              const isWarn = log.severity === 'warning';

              return (
                <div
                  key={log.id}
                  className="relative pl-7 group transition-all"
                >
                  {/* Timeline Node Dot */}
                  <div
                    className={cn(
                      'absolute left-1.5 top-3 w-3.5 h-3.5 -translate-x-1/2 rounded-full border flex items-center justify-center transition-colors',
                      isCrit
                        ? 'bg-red-500 border-red-600'
                        : isWarn
                        ? 'bg-amber-500 border-amber-600'
                        : 'bg-[#0047AB] border-[#003680]'
                    )}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF3EA] border border-[rgba(26,26,26,0.1)] hover:border-[#0047AB]/30 transition-all flex flex-col gap-2 shadow-[0_1px_3px_rgba(26,26,26,0.04)]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white border border-[rgba(26,26,26,0.1)] text-[#555555]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#1A1A1A] leading-tight">
                          {log.action}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold shrink-0 border',
                          isCrit
                            ? 'bg-[#FDF2F2] text-[#B91C1C] border-[#DC2626]/30'
                            : isWarn
                            ? 'bg-[#FEF6E7] text-[#B45309] border-[#D97706]/30'
                            : 'bg-[#EBF1FA] text-[#0047AB] border-[#0047AB]/20'
                        )}
                      >
                        {log.severity}
                      </span>
                    </div>

                    <p className="text-xs text-[#555555] leading-relaxed line-clamp-2">
                      {log.details || `Triggered by ${log.actor}`}
                    </p>

                    <div className="flex items-center justify-between text-xs text-[#777777] pt-1.5 border-t border-[rgba(26,26,26,0.06)]">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#1A1A1A] font-bold">
                        {log.actor}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs">
                        <Clock className="w-3 h-3 text-[#777777]" />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[rgba(26,26,26,0.08)] flex items-center justify-between">
        <Link
          to="/audit"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0047AB] hover:underline transition-colors"
        >
          <span>View All On-Chain Audits</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <span className="text-xs font-mono text-[#666666]">MST Block Confirmed</span>
      </div>
    </Card>
  );
};
