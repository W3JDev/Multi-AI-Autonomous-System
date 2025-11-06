'use client';

import { NotificationItem } from './NotificationItem';

// Local type definition for NotificationItemType
type NotificationItemType = {
  id: string;
  appId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: Date;
};
// Mock data - will be replaced with API calls
const mockNotifications: NotificationItemType[] = [
  {
    id: '1',
    appId: 'punch-clock',
    type: 'late-arrival',
    title: 'Late Arrival Alert',
    message: 'John Doe arrived 15 minutes late',
    read: false,
    link: '/apps/punch-clock/attendance',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    appId: 'waiter-ai',
    type: 'new-order',
    title: 'New Order',
    message: 'Table 5 placed a new order',
    read: false,
    link: '/apps/waiter-ai/orders',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: '3',
    appId: 'flair-ai',
    type: 'training-complete',
    title: 'Training Completed',
    message: 'Sarah completed "Customer Service Basics"',
    read: true,
    link: '/apps/flair-ai/training',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '4',
    appId: 'ai-artisan',
    type: 'ats-score-low',
    title: 'Low ATS Score',
    message: 'Resume "John_Resume.pdf" scored 45/100',
    read: false,
    link: '/apps/ai-artisan/resumes',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: '5',
    appId: 'serene-ai',
    type: 'appointment-soon',
    title: 'Upcoming Appointment',
    message: 'Massage appointment in 30 minutes',
    read: false,
    link: '/apps/serene-ai/appointments',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
];

export function NotificationList() {
  return (
    <div className="max-h-96 overflow-y-auto">
      {mockNotifications.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No notifications
        </div>
      ) : (
        <div className="divide-y">
          {mockNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
