import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { fetchAuditLogs } from '../../lib/api';
import type { AuditLogEntry } from '../../types';
import { ShieldCheck, Terminal, User, Bot, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

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
    <Card className="p-5 sm:p-6 col-span-1 flex flex-col justify-between border-white/[0.08] shadow-2xl">
      <div>
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-[#1E6BFF] border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#FFF8F0] tracking-tight">
                Incident Triage Stream
              </h3>
              <p className="text-[10px] text-[#A3ADC2]">
                Cryptographically hashed audit log
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE FEED
          </span>
        </div>

        {/* Timeline Stream */}
        <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.06]">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6E7A94]">
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
                    className={`absolute left-1.5 top-2.5 w-3 h-3 -translate-x-1/2 rounded-full border flex items-center justify-center transition-colors ${
                      isCrit
                        ? 'bg-red-500/40 border-red-400'
                        : isWarn
                        ? 'bg-amber-500/40 border-amber-400'
                        : 'bg-blue-500/40 border-blue-400'
                    }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-colors flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-white/[0.05] text-[#A3ADC2]">
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-semibold text-[#FFF8F0] leading-tight">
                          {log.action}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold shrink-0 ${
                          isCrit
                            ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                            : isWarn
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#A3ADC2] leading-relaxed line-clamp-2">
                      {log.details || `Triggered by ${log.actor}`}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#6E7A94] pt-1 border-t border-white/[0.03]">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#A3ADC2]">
                        {log.actor}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[9px]">
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

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <Link
          to="/audit"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>View All On-Chain Audits</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
        <span className="text-[10px] font-mono text-[#6E7A94]">MST Block Verified</span>
      </div>
    </Card>
  );
};
