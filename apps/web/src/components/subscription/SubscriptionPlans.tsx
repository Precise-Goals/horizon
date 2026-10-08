import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Check } from 'lucide-react';

export const SubscriptionPlans = () => {
  const plans = [
    { name: 'Explorer', price: 'Free', features: ['Basic Topology Map', '24h Audit Trail', 'Community Support'], color: 'bg-white' },
    { name: 'Guardian', price: '0.05 ETH/mo', features: ['Advanced Topology', '7-day Audit Trail', 'Automated Playbooks'], color: 'bg-[#FFF8F0]' },
    { name: 'Sentinel', price: '0.15 ETH/mo', features: ['Real-time Blast Radius', '30-day Audit Trail', 'Human Approval Gates', 'Priority Support'], color: 'bg-[#0047AB] text-white', isPopular: true },
    { name: 'Enterprise', price: 'Custom', features: ['Unlimited History', 'Custom Playbooks', 'Dedicated Node', '24/7 SLA'], color: 'bg-white' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <Card key={plan.name} className={`relative flex flex-col h-full ${plan.color} ${plan.isPopular ? 'border-[#0047AB] scale-105' : ''}`}>
          {plan.isPopular && (
            <div className="absolute -top-3 -right-3 bg-[#F59E0B] text-black text-xs font-black uppercase px-3 py-1 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] rotate-12">
              Most Popular
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-xl font-black uppercase mb-2">{plan.name}</h3>
            <div className="text-2xl font-bold">{plan.price}</div>
          </div>
          <ul className="flex-1 space-y-3 mb-8">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className={`w-5 h-5 shrink-0 ${plan.isPopular ? 'text-white' : 'text-[#0047AB]'}`} />
                <span className="font-semibold text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <Button 
            variant={plan.isPopular ? "secondary" : "primary"} 
            className="w-full mt-auto"
          >
            Mint NFT Pass
          </Button>
        </Card>
      ))}
    </div>
  );
};
