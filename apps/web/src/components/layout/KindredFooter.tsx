import React from 'react';
import { Link } from 'react-router';
import { HorizonLogo } from '../common/HorizonLogo';
import { ShieldCheck, Lock, ExternalLink, CheckCircle2 } from 'lucide-react';

export const KindredFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E7E7E4] text-neutral-600 text-xs py-[clamp(96px,12vw,160px)] px-6 sm:px-8">
      <div style={{ width: 'min(1200px, 100% - 48px)', margin: '0 auto' }} className="space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <HorizonLogo size={28} />
              <span className="text-lg font-bold tracking-tight text-[#0A0A0A] font-sans">
                Horizon
              </span>
            </Link>
            <p className="text-[#3F3F46] text-[15px] max-w-sm leading-relaxed">
              Autonomous cloud infrastructure resilience platform. Deterministic Kahn topological dependency resolution, Sarvam-105B AI reasoning, and BridgeKey EIP-712 cryptographic approval gates.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>MST Testnet Chain ID 91562037</span>
              <span>&bull;</span>
              <span>Block #4819203</span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <div className="font-semibold text-neutral-900 text-xs tracking-wider">
              Platform
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-black transition-colors">Command Center</Link></li>
              <li><Link to="/topology" className="hover:text-black transition-colors">Topological DAG</Link></li>
              <li><Link to="/recovery" className="hover:text-black transition-colors">Recovery Engine</Link></li>
              <li><Link to="/observability" className="hover:text-black transition-colors">Telemetry Hub</Link></li>
              <li><Link to="/architect" className="hover:text-black transition-colors">AI SRE Copilot</Link></li>
            </ul>
          </div>

          {/* Governance */}
          <div className="space-y-3">
            <div className="font-semibold text-neutral-900 text-xs tracking-wider">
              Governance
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link to="/audit" className="hover:text-black transition-colors">Audit Vault</Link></li>
              <li><Link to="/patents" className="hover:text-black transition-colors">Patents &amp; Research</Link></li>
              <li><Link to="/policies" className="hover:text-black transition-colors">Security Policies</Link></li>
              <li><Link to="/docs" className="hover:text-black transition-colors">Whitepaper &amp; MCP</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-3">
            <div className="font-semibold text-neutral-900 text-xs tracking-wider">
              Assurance
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>SOC 2 Type II</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ISO 27001 Aligned</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>EIP-712 Signatures</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Horizon Autonomous Infrastructure Recovery. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/policies" className="hover:text-neutral-700 transition-colors">Privacy</Link>
            <Link to="/policies" className="hover:text-neutral-700 transition-colors">Terms of Service</Link>
            <Link to="/patents" className="hover:text-neutral-700 transition-colors">Patent Citations</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default KindredFooter;

