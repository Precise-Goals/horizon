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
    <Card className="p-6 sm:p-8 col-span-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neutral-100 text-[#0A0A0A] border border-[#E5E5E5]">
              <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0A0A0A]">
                Incident Triage Stream
              </h3>
              <p className="text-[11px] text-[#6B6B6B] font-mono">
                Cryptographically hashed audit ledger
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-mono font-medium text-[#0A0A0A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
            <span>LIVE FEED</span>
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="space-y-3.5 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-[#E5E5E5]">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#A3A3A3]">
              {loading ? 'Streaming audit trail...' : 'No incident logs recorded yet.'}
            </div>
          ) : (
            logs.map((log) => {
              const actorKey = (log.actor || 'system').toLowerCase();
              const Icon = actorIcon[actorKey] || actorIcon[log.actor] || Terminal;
              const isCrit = log.severity === 'critical';
              const isWarn = log.severity === 'warning';

              return (
                <div key={log.id} className="relative pl-6 group transition-all">
                  {/* Timeline Dot */}
                  <div
                    className={cn(
                      'absolute left-1.5 top-3.5 w-2.5 h-2.5 -translate-x-1/2 rounded-full border flex items-center justify-center transition-colors',
                      isCrit
                        ? 'bg-red-500 border-red-300'
                        : isWarn
                        ? 'bg-amber-500 border-amber-300'
                        : 'bg-[#0A0A0A] border-neutral-300'
                    )}
                  />

                  <div className="p-3.5 rounded-[14px] bg-white border border-[#E5E5E5] hover:border-[#D4D4D4] hover:shadow-sm transition-all flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 rounded bg-neutral-100 text-[#0A0A0A] shrink-0">
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-semibold text-[#0A0A0A] truncate">
                          {log.action}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-medium shrink-0 border',
                          isCrit
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isWarn
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-neutral-100 text-[#6B6B6B] border-[#E5E5E5]'
                        )}
                      >
                        {log.severity}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B6B6B] leading-relaxed line-clamp-2">
                      {log.details || `Triggered by ${log.actor}`}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] pt-1.5 border-t border-[#E5E5E5]">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-[#6B6B6B]">
                        {log.actor}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-2.5 h-2.5" />
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

      <div className="mt-5 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
        <Link
          to="/audit"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A0A0A] hover:underline transition-colors"
        >
          <span>View All On-Chain Audits</span>
          <ExternalLink className="w-3 h-3 text-[#A3A3A3]" />
        </Link>
        <span className="text-[11px] font-mono text-[#A3A3A3]">MST Block Confirmed</span>
      </div>
    </Card>
  );
};

export default RecentActivityWidget;
