import React from 'react';
import { SubscriptionPlans } from '../components/subscription/SubscriptionPlans';

export const SubscriptionPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-4">Web3 Subscriptions</h1>
        <p className="font-semibold text-lg">Unlock advanced autonomous recovery capabilities by minting a subscription NFT pass. Your wallet acts as your identity and license key.</p>
      </div>
      <SubscriptionPlans />
    </div>
  );
};
