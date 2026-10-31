import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { notificationHub, type WarRoomMessage } from '../../engine/notificationHub';
import { Radio, Send, Settings, Check, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

export const WarRoomWidget: React.FC = () => {
  const [messages, setMessages] = useState<WarRoomMessage[]>(() => notificationHub.getMessages());
  const [activeChannel, setActiveChannel] = useState<string>('all');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [webhookUrlInput, setWebhookUrlInput] = useState(() => notificationHub.getWebhookUrl());
  const [webhookSaved, setWebhookSaved] = useState(false);

  useEffect(() => {
    const unsub = notificationHub.subscribe(() => {
      setMessages(notificationHub.getMessages());
    });
    return unsub;
  }, []);

  const handleSaveWebhook = () => {
    notificationHub.setWebhookUrl(webhookUrlInput.trim());
    setWebhookSaved(true);
    setTimeout(() => {
      setWebhookSaved(false);
      setIsConfigOpen(false);
    }, 1500);
  };

  const filteredMessages = activeChannel === 'all'
    ? messages
    : messages.filter((m) => m.channel === activeChannel);

  return (
    <Card className="p-6 col-span-1 lg:col-span-2 flex flex-col justify-between">
      <div>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[rgba(26,26,26,0.08)] gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F5F3FF] border border-[#7C3AED]/25 text-[#7C3AED]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#1A1A1A] tracking-tight">
                  SRE Incident Broadcast & Team War Room
                </h3>
                <span className="horizon-badge text-[10px] text-[#0F8E52] bg-[#EBF7EE] border-[#0F8E52]/20 font-bold">
                  MULTI-CHANNEL
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                Automated cross-team coordination channels and outbound webhook dispatching.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfigOpen((prev) => !prev)}
              className="gap-1.5 text-xs rounded-xl font-bold"
              title="Configure Slack / Discord Webhook URL"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Webhooks</span>
            </Button>
          </div>
        </div>

        {/* Webhook Settings Drawer */}
        {isConfigOpen && (
          <div className="mb-4 p-4 rounded-2xl bg-[#F4EBE0] border border-[rgba(26,26,26,0.12)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#0047AB]" />
                Outbound Incident Webhook Configuration
              </span>
              <span className="text-[10px] font-mono text-[#666666]">Slack &bull; Discord &bull; Custom HTTP</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={webhookUrlInput}
                onChange={(e) => setWebhookUrlInput(e.target.value)}
                placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                className="flex-1 rounded-xl bg-white border border-[rgba(26,26,26,0.14)] px-3 py-1.5 text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:border-[#0047AB]"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveWebhook}
                className="gap-1.5 text-xs rounded-xl px-3 font-bold"
              >
                {webhookSaved ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{webhookSaved ? 'Saved!' : 'Save'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-2 mb-3 border-b border-[rgba(26,26,26,0.06)] pb-2 text-xs">
          <button
            onClick={() => setActiveChannel('all')}
            className={cn(
              'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer',
              activeChannel === 'all'
                ? 'bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20 shadow-sm'
                : 'text-[#666666] hover:text-[#1A1A1A]'
            )}
          >
            All Broadcasts
          </button>
          <button
            onClick={() => setActiveChannel('#sre-bridge')}
            className={cn(
              'px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer',
              activeChannel === '#sre-bridge'
                ? 'bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20 shadow-sm'
                : 'text-[#666666] hover:text-[#1A1A1A]'
            )}
          >
            #sre-bridge
          </button>
          <button
            onClick={() => setActiveChannel('#database-ops')}
            className={cn(
              'px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer',
              activeChannel === '#database-ops'
                ? 'bg-[#FEF6E7] text-[#B45309] border border-[#D97706]/20 shadow-sm'
                : 'text-[#666666] hover:text-[#1A1A1A]'
            )}
          >
            #database-ops
          </button>
          <button
            onClick={() => setActiveChannel('#secops-governance')}
            className={cn(
              'px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer',
              activeChannel === '#secops-governance'
                ? 'bg-[#F5F3FF] text-[#7C3AED] border border-[#7C3AED]/20 shadow-sm'
                : 'text-[#666666] hover:text-[#1A1A1A]'
            )}
          >
            #secops-governance
          </button>
        </div>

        {/* Message Feed Scroll Area */}
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-xl bg-[#FAF3EA] border border-[rgba(26,26,26,0.1)] hover:border-[#0047AB]/30 transition-all space-y-1 shadow-[0_1px_2px_rgba(26,26,26,0.04)]"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#0047AB] font-bold">{msg.channel}</span>
                  <span className="text-[#888888]">&bull;</span>
                  <span className="font-bold text-[#1A1A1A]">{msg.sender}</span>
                </div>
                <div className="flex items-center gap-2">
                  {msg.badge && (
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#FEF6E7] text-[#B45309] border border-[#D97706]/20 font-bold">
                      {msg.badge}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-[#777777]">{msg.timestamp}</span>
                </div>
              </div>
              <p className="text-xs text-[#444444] leading-relaxed">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[rgba(26,26,26,0.08)] flex items-center justify-between text-[10px] font-mono text-[#666666]">
        <span>Outbound Webhook: {notificationHub.getWebhookUrl() ? 'Configured (Active)' : 'Local Broadcast Only'}</span>
        <span>Audit Sync: MST Testnet Block Hash Verified</span>
      </div>
    </Card>
  );
};
export default WarRoomWidget;
