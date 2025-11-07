import { ReactNode } from 'react';

// Application information type
export interface AppInfo {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'indigo';
  route: string;
  enabled: boolean;
}

// Notification item type
export interface NotificationItem {
  id: string;
  appId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: Date;
}

// Applications registry
export const APPS: AppInfo[] = [
  {
    id: 'punch-clock',
    name: 'PUNCH-CLOCK',
    description: 'Employee time tracking and attendance',
    icon: '⏰',
    color: 'blue',
    route: '/apps/punch-clock',
    enabled: true,
  },
  {
    id: 'flair-ai',
    name: 'Flair AI',
    description: 'AI-powered training and development',
    icon: '🎓',
    color: 'green',
    route: '/apps/flair-ai',
    enabled: true,
  },
  {
    id: 'waiter-ai',
    name: 'Waiter AI',
    description: 'Restaurant menu and order management',
    icon: '🍽️',
    color: 'orange',
    route: '/apps/waiter-ai',
    enabled: true,
  },
  {
    id: 'ai-artisan',
    name: 'Ai-Artisan',
    description: 'Resume builder with ATS optimization',
    icon: '📝',
    color: 'purple',
    route: '/apps/ai-artisan',
    enabled: true,
  },
  {
    id: 'serene-ai',
    name: 'Serene AI',
    description: 'Spa and wellness appointment management',
    icon: '💆',
    color: 'pink',
    route: '/apps/serene-ai',
    enabled: true,
  },
  {
    id: 'guest-ai',
    name: 'Guest AI',
    description: 'AI chatbot for customer engagement',
    icon: '💬',
    color: 'indigo',
    route: '/apps/guest-ai',
    enabled: true,
  },
];
