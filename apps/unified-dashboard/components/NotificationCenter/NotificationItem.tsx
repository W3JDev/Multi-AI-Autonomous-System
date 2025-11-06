'use client';

import { formatDistanceToNow } from 'date-fns';
import { NotificationItem as NotificationItemType } from '../../lib/types/dashboard';


// Local definition of APPS to avoid missing import error
const APPS = [
  // Example app objects; replace with actual app data as needed
  { id: 'app1', icon: '📱' },
  { id: 'app2', icon: '💻' },
  // Add more apps as required
];
interface NotificationItemProps {
  notification: NotificationItemType;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const app = APPS.find(a => a.id === notification.appId);
  
  return (
    <button
      onClick={() => {
        if (notification.link) {
          window.location.href = notification.link;
        }
      }}
      className={`w-full p-4 text-left hover:bg-accent transition-colors ${
        !notification.read ? 'bg-muted/50' : ''
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 text-xl">{app?.icon}</div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm">{notification.title}</p>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>
    </button>
  );
}
