'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@repo/ui';
import { NotificationList } from './NotificationList';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [unreadCount] = useState(5); // This will be fetched from API

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg border bg-background p-2 hover:bg-accent hover:text-accent-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </Badge>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-lg border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold">Notifications</h3>
              <button className="text-sm text-primary hover:underline">
                Mark all read
              </button>
            </div>
            <NotificationList />
          </div>
        </>
      )}
    </div>
  );
}
