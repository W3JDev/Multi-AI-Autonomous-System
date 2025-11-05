import * as React from "react";
import { cn } from "../../lib/utils";

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {}

export function Navbar({ className, children, ...props }: NavbarProps) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between border-b bg-background px-4 py-3",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
}

export function Sidebar({ className, collapsed = false, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export interface AppSwitcherProps {
  apps: Array<{
    id: string;
    name: string;
    icon?: React.ReactNode;
    href: string;
  }>;
  currentApp?: string;
  onAppChange?: (appId: string) => void;
  className?: string;
}

export function AppSwitcher({ apps, currentApp, onAppChange, className }: AppSwitcherProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <select
        value={currentApp}
        onChange={(e) => onAppChange?.(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {apps.map((app) => (
          <option key={app.id} value={app.id}>
            {app.name}
          </option>
        ))}
      </select>
    </div>
  );
}
