'use client';

import Link from 'next/link';
import { AppSwitcher } from './AppSwitcher/AppSwitcher';
import { NotificationCenter } from './NotificationCenter/NotificationCenter';
import { LayoutDashboard } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-6 w-6" />
            <span className="hidden md:inline">W3JDev Dashboard</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/" className="text-foreground/60 hover:text-foreground">
              Home
            </Link>
            <Link href="/analytics" className="text-foreground/60 hover:text-foreground">
              Analytics
            </Link>
            <Link href="/notifications" className="text-foreground/60 hover:text-foreground">
              Notifications
            </Link>
            <Link href="/settings/organization" className="text-foreground/60 hover:text-foreground">
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <AppSwitcher />
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
