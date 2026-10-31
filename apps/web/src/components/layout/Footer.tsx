import React from 'react';
import { Link } from 'react-router';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { HorizonLogo } from '../common/HorizonLogo';
import { MST_CONFIG } from '../../engine/mstBlockchain';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FAFAF9] text-[#6B6B6B] border-t border-[#E5E5E5] transition-colors">
      <div className="max-w-[1120px] mx-auto px-6 py-16 sm:py-20 space-y-12">
        
        {/* Top: Brand & 4 link columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <HorizonLogo size={28} />
              <span className="text-base font-bold tracking-tight text-[#0A0A0A]">
                Horizon
              </span>
            </Link>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Autonomous resilience and recovery engine.
            </p>
          </div>

          {/* 4 Link Columns */}
          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
            
            {/* Col 1: Platform */}
            <div className="space-y-3">
              <div className="font-semibold text-[#0A0A0A] uppercase tracking-wider text-[11px] font-mono">
                Platform
              </div>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="hover:text-[#0A0A0A] transition-colors">Command Center</Link></li>
                <li><Link to="/observability" className="hover:text-[#0A0A0A] transition-colors">Observability</Link></li>
                <li><Link to="/topology" className="hover:text-[#0A0A0A] transition-colors">Dependency DAG</Link></li>
                <li><Link to="/recovery" className="hover:text-[#0A0A0A] transition-colors">Recovery Engine</Link></li>
              </ul>
            </div>

            {/* Col 2: Intelligence */}
            <div className="space-y-3">
              <div className="font-semibold text-[#0A0A0A] uppercase tracking-wider text-[11px] font-mono">
                AI &amp; Models
              </div>
              <ul className="space-y-2">
                <li><Link to="/architect" className="hover:text-[#0A0A0A] transition-colors">Sarvam-105B Copilot</Link></li>
                <li><Link to="/docs" className="hover:text-[#0A0A0A] transition-colors">MCP Server Hub</Link></li>
                <li><Link to="/docs" className="hover:text-[#0A0A0A] transition-colors">Prompt Playbooks</Link></li>
                <li><Link to="/docs" className="hover:text-[#0A0A0A] transition-colors">CLI Protocol</Link></li>
              </ul>
            </div>

            {/* Col 3: Governance */}
            <div className="space-y-3">
              <div className="font-semibold text-[#0A0A0A] uppercase tracking-wider text-[11px] font-mono">
                Governance
              </div>
              <ul className="space-y-2">
                <li><Link to="/audit" className="hover:text-[#0A0A0A] transition-colors">On-Chain Audit Vault</Link></li>
                <li><Link to="/subscription" className="hover:text-[#0A0A0A] transition-colors">Subscription Plans</Link></li>
                <li><Link to="/patents" className="hover:text-[#0A0A0A] transition-colors">Patents &amp; Research</Link></li>
                <li><Link to="/policies" className="hover:text-[#0A0A0A] transition-colors">Zero-Trust Charter</Link></li>
              </ul>
            </div>

            {/* Col 4: Network */}
            <div className="space-y-3">
              <div className="font-semibold text-[#0A0A0A] uppercase tracking-wider text-[11px] font-mono">
                Network
              </div>
              <ul className="space-y-2">
                <li>
                  <a
                    href={MST_CONFIG.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0A0A0A] transition-colors inline-flex items-center gap-1"
                  >
                    <span>MSTScan Explorer</span>
                    <ExternalLink className="w-3 h-3 text-[#A3A3A3]" />
                  </a>
                </li>
                <li><span className="text-[#A3A3A3]">Chain ID 91562037</span></li>
                <li><span className="text-[#A3A3A3]">EIP-712 Secp256k1</span></li>
                <li><span className="text-[#A3A3A3]">BridgeKey Protocol</span></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Operational Pill & Legal */}
        <div className="pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A3A3A3]">
          
          <div className="flex items-center gap-3">
            {/* "All systems operational" pill with a pulsing teal dot */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[11px] font-mono text-[#0A0A0A]">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span>All systems operational</span>
            </div>
            <span className="hidden sm:inline text-xs text-[#A3A3A3]">&bull;</span>
            <span className="text-[11px] font-mono">MST Block #4819203</span>
          </div>

          <div className="flex items-center gap-5 text-xs text-[#6B6B6B]">
            <span>&copy; {new Date().getFullYear()} Horizon Platform</span>
            <Link to="/policies" className="hover:text-[#0A0A0A] transition-colors">Privacies</Link>
            <Link to="/patents" className="hover:text-[#0A0A0A] transition-colors">Patents</Link>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
