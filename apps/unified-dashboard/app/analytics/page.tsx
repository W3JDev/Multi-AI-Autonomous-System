'use client';

import { MetricsOverview } from '../../components/UnifiedAnalytics/MetricsOverview';
import { ChartDashboard } from '../../components/UnifiedAnalytics/ChartDashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Cross-app metrics and insights
        </p>
      </div>

      <MetricsOverview />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apps">By App</TabsTrigger>
          <TabsTrigger value="ai">AI Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ChartDashboard />
        </TabsContent>

        <TabsContent value="apps" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            App-specific analytics will be displayed here
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            AI usage details and cost breakdown
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Performance metrics and monitoring
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
