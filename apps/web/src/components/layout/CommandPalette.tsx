import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Network,
  RotateCcw,
  Sparkles,
  Terminal,
  ShieldCheck,
  Gem,
  Zap,
  Search,
  ArrowRight,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { autonomousWatchdog } from '../../engine/watchdog';
import { MST_CONFIG } from '../../engine/mstBlockchain';

interface CommandItem {
  id: string;
  category: 'Navigate' | 'Actions' | 'Governance & Web3';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  perform: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    {
      id: 'nav-dashboard',
      category: 'Navigate',
      title: 'Command Center',
      subtitle: 'Real-time telemetry, MTTR, & health overview',
      icon: LayoutDashboard,
      perform: () => { navigate('/dashboard'); onClose(); },
    },
    {
      id: 'nav-observability',
      category: 'Navigate',
      title: 'Live Observability & APM',
      subtitle: 'Incident detection, P1 tripwires, and alert sound',
      icon: Activity,
      perform: () => { navigate('/observability'); onClose(); },
      badge: 'Live',
    },
    {
      id: 'nav-topology',
      category: 'Navigate',
      title: 'Multi-Tier Dependency DAG',
      subtitle: 'Kahn topological sort and blast radius visualization',
      icon: Network,
      perform: () => { navigate('/topology'); onClose(); },
    },
    {
      id: 'nav-recovery',
      category: 'Navigate',
      title: 'Autonomous Recovery Engine',
      subtitle: 'Deterministic playbooks with BridgeKey approval gates',
      icon: RotateCcw,
      perform: () => { navigate('/recovery'); onClose(); },
    },
    {
      id: 'nav-architect',
      category: 'Navigate',
      title: 'AI Flow Architect',
      subtitle: 'Sarvam AI natural-language topology synthesizer',
      icon: Sparkles,
      perform: () => { navigate('/architect'); onClose(); },
    },
    {
      id: 'nav-docs',
      category: 'Navigate',
      title: 'MCP Server Hub & Docs',
      subtitle: 'Model Context Protocol endpoints and CLI guide',
      icon: Terminal,
      perform: () => { navigate('/docs'); onClose(); },
    },
    {
      id: 'action-sentinel',
      category: 'Actions',
      title: 'Toggle Chaos Sentinel',
      subtitle: 'Trigger synthetic failure injection to test resilience',
      icon: Zap,
      perform: () => { autonomousWatchdog.toggleSentinel(); onClose(); },
      badge: 'Chaos',
    },
    {
      id: 'nav-audit',
      category: 'Governance & Web3',
      title: 'Cryptographic Audit Vault',
      subtitle: 'Hash-chained SHA-256 Merkle root verification',
      icon: ShieldCheck,
      perform: () => { navigate('/audit'); onClose(); },
    },
    {
      id: 'nav-subscription',
      category: 'Governance & Web3',
      title: 'Web3 Subscription Plans',
      subtitle: 'ERC-721 token-gated operator clearance tiers',
      icon: Gem,
      perform: () => { navigate('/subscription'); onClose(); },
    },
    {
      id: 'action-explorer',
      category: 'Governance & Web3',
      title: 'Open MST Testnet Explorer',
      subtitle: 'Chain ID 91562037 block and transaction ledger',
      icon: ExternalLink,
      perform: () => { window.open(MST_CONFIG.explorerUrl, '_blank'); onClose(); },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].perform();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[620px] rounded-[16px] bg-[#141416] border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Specular highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/50 to-transparent" />

            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
              <Search className="w-4 h-4 text-[#A0A0AB] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or jump to screen... (⌘K)"
                className="w-full bg-transparent text-sm text-[#ECECF0] placeholder-[#63636E] outline-none font-sans"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-[#63636E] bg-white/[0.05] border border-white/[0.08]">
                ESC
              </kbd>
            </div>

            {/* Results list */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#63636E]">
                  No commands match "{query}"
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => item.perform()}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-[8px] text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A1A1D] border border-white/[0.09] text-[#ECECF0]'
                          : 'text-[#A0A0AB] hover:text-[#ECECF0] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-1.5 rounded-[6px] shrink-0 ${
                            isSelected
                              ? 'bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30'
                              : 'bg-white/[0.04] text-[#A0A0AB]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-[#ECECF0] flex items-center gap-2 truncate">
                            {item.title}
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#6366F1]/15 text-[#7C7FF7] border border-[#6366F1]/25">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-[#63636E] truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[10px] font-mono text-[#63636E] hidden sm:inline">
                          {item.category}
                        </span>
                        {isSelected && (
                          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#A0A0AB] bg-white/[0.06] border border-white/[0.1]">
                            ↵
                          </kbd>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer indicator */}
            <div className="px-4 py-2 border-t border-white/[0.06] bg-[#111113] flex items-center justify-between text-[11px] text-[#63636E] font-mono">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                <span>Horizon SRE v3.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
