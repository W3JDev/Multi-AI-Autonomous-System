'use client';

import { NotificationList } from '../../components/NotificationCenter/NotificationList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui';

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            All notifications from your applications
          </p>
        </div>
        <button className="text-sm text-primary hover:underline">
          Mark all as read
        </button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="punch-clock">PUNCH-CLOCK</TabsTrigger>
          <TabsTrigger value="flair-ai">Flair AI</TabsTrigger>
          <TabsTrigger value="waiter-ai">Waiter AI</TabsTrigger>
          <TabsTrigger value="ai-artisan">Ai-Artisan</TabsTrigger>
          <TabsTrigger value="serene-ai">Serene AI</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <NotificationList />
          </div>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <NotificationList />
          </div>
        </TabsContent>

        <TabsContent value="punch-clock" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            PUNCH-CLOCK notifications
          </div>
        </TabsContent>

        <TabsContent value="flair-ai" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Flair AI notifications
          </div>
        </TabsContent>

        <TabsContent value="waiter-ai" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Waiter AI notifications
          </div>
        </TabsContent>

        <TabsContent value="ai-artisan" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Ai-Artisan notifications
          </div>
        </TabsContent>

        <TabsContent value="serene-ai" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Serene AI notifications
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
