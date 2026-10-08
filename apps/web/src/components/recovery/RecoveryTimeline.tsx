import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const RecoveryTimeline = () => {
  const [step, setStep] = useState(1);
  const [approved, setApproved] = useState(false);

  const steps = [
    { id: 1, title: 'Isolate Postgres DB', status: step > 1 ? 'healthy' : (step === 1 ? 'recovering' : 'degraded') },
    { id: 2, title: 'Human Approval Gate', status: step > 2 ? 'healthy' : (step === 2 ? (approved ? 'approved' : 'high-risk') : 'degraded') },
    { id: 3, title: 'Failover to Replica', status: step > 3 ? 'healthy' : (step === 3 ? 'recovering' : 'degraded') },
    { id: 4, title: 'Invalidate Redis Cache', status: step > 4 ? 'healthy' : (step === 4 ? 'recovering' : 'degraded') },
    { id: 5, title: 'Restart API Gateway', status: step > 5 ? 'healthy' : (step === 5 ? 'recovering' : 'degraded') },
  ];

  const handleNext = () => {
    if (step === 2 && !approved) return;
    if (step < 6) setStep(step + 1);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b-2 border-[#1A1A1A] pb-4">
        <h2 className="text-xl font-black uppercase">Active Recovery Playbook</h2>
        <Badge status="recovering">Execution In Progress</Badge>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-[#1A1A1A]">
        {steps.map((s, i) => (
          <div key={s.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#1A1A1A] bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[2px_2px_0px_#1A1A1A] ${s.status === 'recovering' ? 'animate-bounce' : ''}`}>
              <span className="font-bold text-sm">{s.id}</span>
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border-[3px] border-[#1A1A1A] bg-white shadow-[4px_4px_0px_#1A1A1A]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold uppercase text-sm">{s.title}</h3>
                <Badge status={s.status as any}>{s.status}</Badge>
              </div>
              
              {s.id === 2 && step === 2 && (
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="warning" 
                    className="w-full"
                    onClick={() => { setApproved(true); setTimeout(() => setStep(3), 500); }}
                  >
                    Approve Failover
                  </Button>
                  <Button size="sm" variant="danger" className="w-full">Reject</Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={step > 5 || (step === 2 && !approved)}>
          {step > 5 ? 'Playbook Completed' : 'Force Next Step'}
        </Button>
      </div>
    </Card>
  );
};
