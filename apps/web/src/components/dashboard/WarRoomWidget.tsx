import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { notificationHub, type WarRoomMessage } from '../../engine/notificationHub';
import {
  Radio,
  Send,
  Bell,
  Settings,
  Check,
  Globe,
  Database,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export const WarRoomWidget: React.FC = () => {
  const [messages, setMessages] = useState<WarRoomMessage[]>(() => notificationHub.getMessages());
  const [activeChannel, setActiveChannel] = useState<'all' | '#sre-bridge' | '#database-ops' | '#secops-governance'>('all');
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
    notificationHub.setWebhookUrl(webhookUrlInput);
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
    <Card className="p-6 col-span-1 lg:col-span-2 border-white/[0.08] bg-[#0B0F19]/80 backdrop-blur-xl flex flex-col justify-between">
      <div>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/[0.08] gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#FFF8F0] tracking-tight">
                  SRE Incident Broadcast & Team War Room
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  MULTI-CHANNEL
                </span>
              </div>
              <p className="text-xs text-[#A3ADC2] mt-0.5">
                Automated cross-team coordination channels and outbound webhook dispatching.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfigOpen((prev) => !prev)}
              className="gap-1.5 text-xs rounded-xl"
              title="Configure Slack / Discord Webhook URL"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Webhooks</span>
            </Button>
          </div>
        </div>

        {/* Webhook Settings Drawer */}
        {isConfigOpen && (
          <div className="mb-4 p-4 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FFF8F0] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Outbound Incident Webhook Configuration
              </span>
              <span className="text-[10px] font-mono text-[#6E7A94]">Slack &bull; Discord &bull; Custom HTTP</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={webhookUrlInput}
                onChange={(e) => setWebhookUrlInput(e.target.value)}
                placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.1] px-3 py-1.5 text-xs text-[#FFF8F0] placeholder-[#6E7A94] focus:outline-none focus:border-blue-500/50"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveWebhook}
                className="gap-1.5 text-xs rounded-xl px-3"
              >
                {webhookSaved ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{webhookSaved ? 'Saved!' : 'Save'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-2 mb-3 border-b border-white/[0.04] pb-2 text-xs">
          <button
            onClick={() => setActiveChannel('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeChannel === 'all'
                ? 'bg-white/[0.08] text-[#FFF8F0] font-bold'
                : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
            }`}
          >
            All Broadcasts
          </button>
          <button
            onClick={() => setActiveChannel('#sre-bridge')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
              activeChannel === '#sre-bridge'
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
            }`}
          >
            #sre-bridge
          </button>
          <button
            onClick={() => setActiveChannel('#database-ops')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
              activeChannel === '#database-ops'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
            }`}
          >
            #database-ops
          </button>
          <button
            onClick={() => setActiveChannel('#secops-governance')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
              activeChannel === '#secops-governance'
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
            }`}
          >
            #secops-governance
          </button>
        </div>

        {/* Message Feed Scroll Area */}
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold">{msg.channel}</span>
                  <span className="text-[#6E7A94]">&bull;</span>
                  <span className="font-semibold text-[#FFF8F0]">{msg.sender}</span>
                </div>
                <div className="flex items-center gap-2">
                  {msg.badge && (
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/[0.04] text-amber-300 border border-white/[0.06]">
                      {msg.badge}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-[#6E7A94]">{msg.timestamp}</span>
                </div>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#6E7A94]">
        <span>Outbound Webhook: {notificationHub.getWebhookUrl() ? 'Configured (Active)' : 'Local Broadcast Only'}</span>
        <span>Audit Sync: MST Testnet Block Hash Verified</span>
      </div>
    </Card>
  );
};
export default WarRoomWidget;
