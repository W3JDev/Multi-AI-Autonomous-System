'use client';

import { StatsCard } from '@repo/ui';
import { Activity, TrendingUp, DollarSign, Zap } from 'lucide-react';

export function MetricsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Sessions"
        value="12,345"
        description="Last 30 days"
        trend={{ value: 15, positive: true, label: 'vs previous period' }}
        icon={<Activity className="h-5 w-5" />}
      />
      <StatsCard
        title="Active Users"
        value="284"
        description="Across all apps"
        trend={{ value: 8, positive: true, label: 'vs last month' }}
        icon={<Activity className="h-5 w-5" />}
      />
      <StatsCard
        title="AI Requests"
        value="8,432"
        description="This month"
        trend={{ value: 23, positive: true, label: 'vs last month' }}
        icon={<Zap className="h-5 w-5" />}
      />
      <StatsCard
        title="Total Revenue"
        value="$12,450"
        description="Last 30 days"
        trend={{ value: 12, positive: true, label: 'vs last month' }}
        icon={<DollarSign className="h-5 w-5" />}
      />
    </div>
  );
}
