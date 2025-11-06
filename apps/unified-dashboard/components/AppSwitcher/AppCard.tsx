'use client';

// import { AppInfo } from '../../lib/types/dashboard';

// Define AppInfo type locally (copied or inferred from usage)
interface AppInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
}
interface AppCardProps {
  app: AppInfo;
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
};

export function AppCard({ app, onClick }: AppCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-lg border bg-card p-4 text-left hover:bg-accent transition-colors"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[app.color as keyof typeof colorClasses]} text-2xl`}>
        {app.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{app.name}</h3>
        <p className="text-sm text-muted-foreground">{app.description}</p>
      </div>
      {!app.enabled && (
        <span className="text-xs text-muted-foreground">Disabled</span>
      )}
    </button>
  );
}
