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
    <Card className="p-6 sm:p-7 col-span-1 flex flex-col justify-between border-white/[0.08] shadow-2xl">
      <div>
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-[#1E6BFF] border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#FFF8F0] tracking-tight">
                Incident Triage Stream
              </h3>
              <p className="text-xs text-[#A3ADC2]">
                Cryptographically hashed audit ledger
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE FEED
          </span>
        </div>

        {/* Timeline Stream */}
        <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.08]">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#8E9DB8]">
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
                    className={`absolute left-1.5 top-3 w-3.5 h-3.5 -translate-x-1/2 rounded-full border flex items-center justify-center transition-colors ${
                      isCrit
                        ? 'bg-red-500/40 border-red-400'
                        : isWarn
                        ? 'bg-amber-500/40 border-amber-400'
                        : 'bg-blue-500/40 border-blue-400'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.14] transition-colors flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/[0.05] text-[#A3ADC2]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#FFF8F0] leading-tight">
                          {log.action}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full uppercase font-bold shrink-0 ${
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

                    <p className="text-xs sm:text-sm text-[#A3ADC2] leading-relaxed line-clamp-2">
                      {log.details || `Triggered by ${log.actor}`}
                    </p>

                    <div className="flex items-center justify-between text-xs text-[#8E9DB8] pt-1.5 border-t border-white/[0.04]">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#A3ADC2] font-semibold">
                        {log.actor}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs">
                        <Clock className="w-3 h-3 text-[#6E7A94]" />
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

      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link
          to="/audit"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>View All On-Chain Audits</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <span className="text-xs font-mono text-[#8E9DB8]">MST Block Confirmed</span>
      </div>
    </Card>
  );
};
