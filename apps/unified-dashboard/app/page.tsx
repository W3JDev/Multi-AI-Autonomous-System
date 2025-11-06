'use client';

import Link from 'next/link';
import { StatsCard } from '@repo/ui';
import { APPS } from '../lib/types/dashboard';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity,
  Calendar,
  FileText,
  GraduationCap,
  UtensilsCrossed,
} from 'lucide-react';

// Mock data - will be replaced with API calls
const mockStats: Record<string, Array<{
  label: string;
  value: string;
  icon: any;
  trend?: number;
  positive?: boolean;
}>> = {
  'punch-clock': [
    { label: 'Total Employees', value: '142', icon: Users },
    { label: 'Attendance Rate', value: '94%', trend: 2, positive: true, icon: TrendingUp },
  ],
  'flair-ai': [
    { label: 'Training Completion', value: '78%', icon: GraduationCap },
    { label: 'Active Sessions', value: '23', icon: Activity },
  ],
  'waiter-ai': [
    { label: 'Active Menus', value: '5', icon: UtensilsCrossed },
    { label: 'Recent Orders', value: '87', icon: Clock },
  ],
  'ai-artisan': [
    { label: 'Resumes Created', value: '45', icon: FileText },
    { label: 'Avg ATS Score', value: '82', trend: 5, positive: true, icon: TrendingUp },
  ],
  'serene-ai': [
    { label: 'Appointments Today', value: '12', icon: Calendar },
    { label: 'Services Active', value: '8', icon: Activity },
  ],
  'guest-ai': [
    { label: 'Active Chats', value: '34', icon: Activity },
    { label: 'Response Time', value: '2m', icon: Clock },
  ],
};

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your unified control center
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Apps"
          value={APPS.length}
          description="Active applications"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Users"
          value="284"
          description="Across all apps"
          trend={{ value: 12, positive: true, label: 'vs last month' }}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="AI Requests"
          value="1,234"
          description="This month"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatsCard
          title="Uptime"
          value="99.9%"
          description="Last 30 days"
          trend={{ value: 0.1, positive: true }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Applications Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Applications</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app) => {
            const stats = mockStats[app.id as keyof typeof mockStats] || [];
            return (
              <Link
                key={app.id}
                href={app.route}
                className="group rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[app.color as keyof typeof colorClasses]} text-2xl flex-shrink-0`}>
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                </div>
                
                {stats.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    {stats.map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Icon className="h-4 w-4" />
                            <span>{stat.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{stat.value}</span>
                            {stat.trend && (
                              <span className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.positive ? '+' : '-'}{stat.trend}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/analytics"
            className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">View Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Cross-app metrics and insights
            </p>
          </Link>
          <Link
            href="/notifications"
            className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">All Notifications</h3>
            <p className="text-sm text-muted-foreground">
              View all app notifications
            </p>
          </Link>
          <Link
            href="/settings/organization"
            className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">Organization Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage apps and users
            </p>
          </Link>
          <Link
            href="/settings/integrations"
            className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">Integrations</h3>
            <p className="text-sm text-muted-foreground">
              Configure AI and services
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
