'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@repo/ui';
import { Search, Command as CommandIcon } from 'lucide-react';
// import { APPS } from '../../lib/types/dashboard';
import { AppCard } from './AppCard';

export function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredApps = APPS.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search apps...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <CommandIcon className="h-3 w-3" />K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border bg-background pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {filteredApps.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No applications found
                </div>
              ) : (
                filteredApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onClick={() => {
                      setOpen(false);
                      window.location.href = app.route;
                    }}
                  />
                ))
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <kbd className="rounded border px-2 py-1">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-4">
                <kbd className="rounded border px-2 py-1">Enter</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-4">
                <kbd className="rounded border px-2 py-1">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
