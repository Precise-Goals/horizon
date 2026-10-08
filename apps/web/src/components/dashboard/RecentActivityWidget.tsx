import React from 'react';
import { Card } from '../common/Card';

export const RecentActivityWidget = () => {
  const activities = [
    { time: '10:42 AM', user: 'System', action: 'Automated snapshot created' },
    { time: '10:35 AM', user: 'Admin', action: 'Security policy updated' },
    { time: '09:15 AM', user: 'Auto-Scaler', action: 'Scaled up compute instances' },
    { time: '08:00 AM', user: 'System', action: 'Daily backup verified' },
  ];

  return (
    <Card className="col-span-1 h-full">
      <h2 className="text-xl font-black uppercase mb-4 border-b-2 border-[#1A1A1A] pb-2">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((act, i) => (
          <div key={i} className="flex flex-col border-l-4 border-[#0047AB] pl-3 py-1">
            <span className="text-xs font-bold text-gray-500 uppercase">{act.time} &bull; {act.user}</span>
            <span className="text-sm font-semibold mt-1">{act.action}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
