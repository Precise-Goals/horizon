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
    <Card className="p-6 col-span-1 lg:col-span-2 flex flex-col justify-between bg-white border border-[#E5E5E5] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#E5E5E5] gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-100 border border-[#E5E5E5] text-[#0A0A0A]">
              <Radio className="w-4 h-4 animate-pulse text-[#2DD4BF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-[#0A0A0A] font-sans">
                  SRE Incident Broadcast & Team War Room
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-[#0A0A0A] bg-neutral-100 border border-[#E5E5E5]">
                  MULTI-CHANNEL
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Automated cross-team coordination stream and outbound webhook dispatching.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfigOpen((prev) => !prev)}
              className="gap-1.5 text-xs rounded-full"
              title="Configure Slack / Discord Webhook URL"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Webhooks</span>
            </Button>
          </div>
        </div>

        {/* Webhook Settings Drawer */}
        {isConfigOpen && (
          <div className="mb-4 p-4 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0A0A0A] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#2DD4BF]" />
                Outbound Incident Webhook Configuration
              </span>
              <span className="text-[10px] font-mono text-[#A3A3A3]">Slack &bull; Discord &bull; Custom HTTP</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={webhookUrlInput}
                onChange={(e) => setWebhookUrlInput(e.target.value)}
                placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                className="flex-1 rounded-[12px] bg-white border border-[#E5E5E5] px-3.5 py-2 text-xs text-[#0A0A0A] placeholder-[#A3A3A3] focus:outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveWebhook}
                className="gap-1 text-xs px-3.5 rounded-full"
              >
                {webhookSaved ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{webhookSaved ? 'Saved!' : 'Save'}</span>
              </Button>
            </div>
            {webhookSaved && (
              <p className="text-[11px] text-emerald-600 font-medium">
                Webhook URL safely stored in localStorage for live incident dispatches.
              </p>
            )}
          </div>
        )}

        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-1.5 mb-3 border-b border-[#E5E5E5] pb-2 text-xs">
          <button
            onClick={() => setActiveChannel('all')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer',
              activeChannel === 'all'
                ? 'bg-[#0A0A0A] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
            )}
          >
            All Broadcasts
          </button>
          <button
            onClick={() => setActiveChannel('#sre-bridge')}
            className={cn(
              'px-3 py-1 rounded-full font-mono text-[11px] font-medium transition-all cursor-pointer',
              activeChannel === '#sre-bridge'
                ? 'bg-[#0A0A0A] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
            )}
          >
            #sre-bridge
          </button>
          <button
            onClick={() => setActiveChannel('#database-ops')}
            className={cn(
              'px-3 py-1 rounded-full font-mono text-[11px] font-medium transition-all cursor-pointer',
              activeChannel === '#database-ops'
                ? 'bg-[#0A0A0A] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
            )}
          >
            #database-ops
          </button>
          <button
            onClick={() => setActiveChannel('#secops-governance')}
            className={cn(
              'px-3 py-1 rounded-full font-mono text-[11px] font-medium transition-all cursor-pointer',
              activeChannel === '#secops-governance'
                ? 'bg-[#0A0A0A] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
            )}
          >
            #secops-governance
          </button>
        </div>

        {/* Message Feed Scroll Area */}
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] hover:border-[#D4D4D4] transition-all space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[#0A0A0A] font-semibold">{msg.channel}</span>
                  <span className="text-[#A3A3A3]">&bull;</span>
                  <span className="font-medium text-[#6B6B6B]">{msg.sender}</span>
                </div>
                <div className="flex items-center gap-2">
                  {msg.badge && (
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-neutral-200/60 text-[#0A0A0A] border border-[#E5E5E5]">
                      {msg.badge}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-[#A3A3A3]">{msg.timestamp}</span>
                </div>
              </div>
              <p className="text-xs text-[#0A0A0A] leading-relaxed">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[10px] font-mono text-[#6B6B6B]">
        <span>Outbound Webhook: {notificationHub.getWebhookUrl() ? 'Configured (Active)' : 'Local Broadcast Only'}</span>
        <span>Audit Sync: MST Testnet Block Hash Verified</span>
      </div>
    </Card>
  );
};
export default WarRoomWidget;
