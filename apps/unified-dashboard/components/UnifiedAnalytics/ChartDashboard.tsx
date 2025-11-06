'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui';
import { APPS } from '../../lib/types/dashboard';

export function ChartDashboard() {
  // Mock data - in production, this would come from API
  const appUsageData = APPS.map(app => ({
    name: app.name,
    sessions: Math.floor(Math.random() * 1000) + 500,
    users: Math.floor(Math.random() * 100) + 50,
  }));

  const aiProviderData = [
    { provider: 'Gemini', requests: 5234, cost: 156.78 },
    { provider: 'DeepSeek', requests: 3198, cost: 95.94 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* App Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>App Usage by Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appUsageData.map((app) => (
              <div key={app.name}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium">{app.name}</span>
                  <span className="text-muted-foreground">{app.sessions} sessions</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(app.sessions / 1500) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Provider Usage */}
      <Card>
        <CardHeader>
          <CardTitle>AI Provider Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {aiProviderData.map((provider) => (
              <div key={provider.provider} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{provider.provider}</span>
                  <span className="text-sm text-muted-foreground">
                    ${provider.cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{provider.requests.toLocaleString()} requests</span>
                  <span>${(provider.cost / provider.requests).toFixed(4)}/req</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(provider.requests / 6000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Active Users by App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appUsageData.map((app) => (
              <div key={app.name}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium">{app.name}</span>
                  <span className="text-muted-foreground">{app.users} users</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(app.users / 150) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg Response Time</span>
              <span className="text-2xl font-bold">124ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-2xl font-bold text-green-600">99.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error Rate</span>
              <span className="text-2xl font-bold text-red-600">0.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uptime</span>
              <span className="text-2xl font-bold text-green-600">99.9%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
