import React from 'react';
import { SubscriptionPlans } from '../components/subscription/SubscriptionPlans';

export const SubscriptionPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#FFF8F0]">
          Web3 Platform Subscriptions
        </h1>
        <p className="text-xs text-[#A3ADC2] mt-0.5">
          Decentralized subscription passes minted as ERC-721 smart contract tokens on MST Blockchain Testnet (Chain ID 91562037) with BridgeKey wallet verification.
        </p>
      </div>
      <SubscriptionPlans />
    </div>
  );
};
