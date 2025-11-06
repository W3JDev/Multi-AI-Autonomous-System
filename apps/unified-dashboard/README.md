# Unified Dashboard - W3JDev AI Ecosystem Control Center

The central hub for managing and monitoring all 6 AI-powered applications in the W3JDev ecosystem.

## Features

### �� Main Dashboard
- Overview of all 6 applications with real-time stats
- Quick stats cards showing key metrics across the ecosystem
- Visual app cards with application-specific data
- Quick actions for common tasks

### ⌨️ App Switcher (Cmd/Ctrl + K)
- Command palette-style interface for quick navigation
- Search across all applications
- Keyboard shortcuts for power users
- Recent and frequently used apps

### 🔔 Notification Center
- Cross-app notification aggregation
- Real-time notification updates
- Notification types:
  - `punch-clock:late-arrival`
  - `restaurant-ai:new-order`
  - `flair-ai:training-complete`
  - `ai-artisan:ats-score-low`
  - `serene-ai:appointment-soon`
- Mark as read functionality
- Notification filtering by app

### 📊 Analytics Dashboard
- Total sessions, active users, AI requests, and revenue metrics
- App usage by sessions and active users
- AI provider usage (Gemini vs DeepSeek) with cost breakdown
- Performance metrics (response time, success rate, uptime)
- Interactive charts and visualizations
- Tabbed interface for different analytics views

### ⚙️ Organization Settings
- Organization information management
- App enablement toggles (enable/disable apps per org)
- Subscription plan selection
- AI configuration:
  - Primary AI provider selection (Gemini/DeepSeek)
  - Auto-fallback enablement
  - Monthly AI budget settings

## Tech Stack

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **@repo/ui** shared component library
- **Lucide React** for icons
- **date-fns** for date formatting
- **Framer Motion** for animations (ready)

## Structure

```
apps/unified-dashboard/
├── app/
│   ├── page.tsx                    # Main dashboard
│   ├── layout.tsx                  # Root layout with navbar
│   ├── analytics/
│   │   └── page.tsx                # Analytics dashboard
│   ├── notifications/
│   │   └── page.tsx                # Notifications page
│   └── settings/
│       └── organization/
│           └── page.tsx            # Organization settings
├── components/
│   ├── Navbar.tsx                  # Top navigation
│   ├── AppSwitcher/
│   │   ├── AppSwitcher.tsx         # Cmd+K app switcher
│   │   └── AppCard.tsx             # App selection card
│   ├── NotificationCenter/
│   │   ├── NotificationCenter.tsx  # Notification dropdown
│   │   ├── NotificationList.tsx    # List of notifications
│   │   └── NotificationItem.tsx    # Individual notification
│   └── UnifiedAnalytics/
│       ├── MetricsOverview.tsx     # Stats cards
│       └── ChartDashboard.tsx      # Analytics charts
└── lib/
    └── types/
        └── dashboard.ts            # TypeScript types
```

## Applications

The dashboard manages these 6 applications:

1. **PUNCH-CLOCK** (Port 3000) - HR & Attendance Management
2. **Flair AI** (Port 3001) - Staff Training & Development
3. **Waiter AI** (Port 3002) - Restaurant Service Management
4. **Guest AI** (Port 3003) - Customer Assistant & Support
5. **Serene AI** (Port 3004) - Spa & Salon Management
6. **Ai-Artisan** (Port 3005) - AI-Powered Resume Builder

## Development

```bash
# Install dependencies
pnpm install

# Start development server (port 3006)
pnpm dev

# Build for production
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Future Enhancements

- [ ] Real-time WebSocket notifications
- [ ] API routes for data fetching
- [ ] Cross-app data integrations
- [ ] Advanced analytics with Recharts
- [ ] User management interface
- [ ] Billing and subscription management
- [ ] Export capabilities for analytics
- [ ] Custom date range filtering
- [ ] Mobile app views
- [ ] Dark mode toggle

## Integration

The dashboard integrates with:
- **@repo/ui** - Shared UI components
- **@repo/database** - Unified database schema
- **@repo/auth** - Multi-tenant authentication
- **@repo/ai** - AI engine for cost tracking
- **@repo/api** - tRPC API client

All apps share the same database schema with multi-tenant RLS policies for secure data access.
