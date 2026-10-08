import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/common/Button';
import { ShieldCheck, Activity, Network } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-white border-2 border-[#1A1A1A] px-4 py-2 shadow-[2px_2px_0px_#1A1A1A] mb-4">
          <div className="w-3 h-3 bg-[#0047AB] rounded-full animate-pulse"></div>
          <span className="font-bold uppercase tracking-wider text-sm">Horizon v1.0 Live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
          Autonomous <br />
          <span className="text-[#0047AB] bg-white px-4 border-4 border-[#1A1A1A] inline-block mt-2 shadow-[8px_8px_0px_#1A1A1A] -rotate-2">Enterprise</span> <br />
          Recovery Platform
        </h1>
        
        <p className="text-xl md:text-2xl font-semibold max-w-2xl mx-auto mt-8">
          Self-healing infrastructure with cryptographic audit trails and deterministic blast radius analysis.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          <Link to="/dashboard">
            <Button size="lg" className="w-full sm:w-auto text-xl px-8 py-4">Enter Platform</Button>
          </Link>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto text-xl px-8 py-4">Read Docs</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          <FeatureCard icon={<ShieldCheck />} title="Cryptographic Audits" desc="Immutable ledger for every recovery action." />
          <FeatureCard icon={<Network />} title="Blast Radius" desc="Real-time DAG visualization of failures." />
          <FeatureCard icon={<Activity />} title="Auto-Recovery" desc="Pre-approved deterministic playbooks." />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white border-4 border-[#1A1A1A] p-6 text-left shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1A1A1A] transition-all">
    <div className="w-12 h-12 bg-[#FFF8F0] border-2 border-[#1A1A1A] flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-black uppercase mb-2">{title}</h3>
    <p className="font-semibold text-gray-700">{desc}</p>
  </div>
);
