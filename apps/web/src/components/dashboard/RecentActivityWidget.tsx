import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { fetchAuditLogs } from '../../lib/api';
import type { AuditLogEntry } from '../../types';
import { ShieldCheck, Terminal, User, Bot, Clock } from 'lucide-react';

const actorIcon: Record<string, React.ElementType> = {
  system: Terminal,
  human: User,
  llm_agent: Bot,
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
    const interval = setInterval(loadLogs, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Card className="p-6 col-span-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E6BFF]" />
            <h3 className="text-base font-semibold text-[#FFF8F0] tracking-tight">
              Incident Audit Stream
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE FEED
          </span>
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6E7A94]">
              {loading ? 'Streaming audit trail...' : 'No incident logs recorded yet.'}
            </div>
          ) : (
            logs.map((log) => {
              const Icon = actorIcon[log.actor] || Terminal;
              const isCrit = log.severity === 'critical';
              const isWarn = log.severity === 'warning';

              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-colors flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-white/[0.05] text-[#A3ADC2]">
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#FFF8F0]">
                        {log.action}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                        isCrit
                          ? 'bg-red-500/15 text-red-300'
                          : isWarn
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-blue-500/10 text-blue-300'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#A3ADC2] pt-1">
                    <span className="truncate max-w-[180px]">{log.details || log.actor}</span>
                    <span className="flex items-center gap-1 font-mono text-[9px] text-[#6E7A94]">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#A3ADC2] flex justify-between items-center">
        <span>Tamper-proof audit buffer</span>
        <a href="/audit" className="text-blue-400 hover:underline text-[11px] font-medium">
          View full log →
        </a>
      </div>
    </Card>
  );
};
