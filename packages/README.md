# Phase 3: Shared Packages

This directory contains the 4 core shared packages that all applications in the W3JDev AI Ecosystem use.

## 📦 Packages

### 1. `@repo/ui` - Shared Component Library

**Location:** `packages/shared-ui/`

A comprehensive React component library with 50+ components built on:
- **React 19** with TypeScript
- **Radix UI** primitives for accessibility
- **Tailwind CSS** for styling
- **class-variance-authority** for component variants
- **Framer Motion** for animations

**Components Include:**
- Core: Button, Card, Input, Label, Select, Dialog, Tabs, Avatar, Badge, Progress, Skeleton, Toast
- Data: Table, DataTable (with sorting/filtering)
- Navigation: Navbar, Sidebar, AppSwitcher
- Dashboard: DashboardLayout, DashboardWidget, StatsCard
- Forms: FormField, FormError, FormLabel
- AI: ChatInterface, ChatMessage, ChatInput

**Usage:**
```typescript
import { Button, Card, CardHeader, CardContent } from '@repo/ui';

<Card>
  <CardHeader>
    <h2>Hello World</h2>
  </CardHeader>
  <CardContent>
    <Button variant="default" size="lg">Click me</Button>
  </CardContent>
</Card>
```

---

### 2. `@repo/ai` - Unified AI Engine

**Location:** `packages/ai-engine/`

A unified AI service that provides:
- **Google Gemini** integration (primary)
- **DeepSeek** auto-fallback
- Chat, streaming, and analysis capabilities
- Cost tracking and usage analytics

**Features:**
- Chat with system prompts
- Streaming responses (AsyncGenerator)
- Analysis types: resume-scoring, menu-optimization, sentiment-analysis, data-insights
- Voice API placeholder (Gemini Live)
- Automatic provider fallback
- Usage metrics tracking

**Usage:**
```typescript
import { ai, createAIEngine } from '@repo/ai';

// Using singleton
const response = await ai.chat("What is the meaning of life?");

// Streaming
for await (const chunk of ai.stream("Tell me a story")) {
  console.log(chunk);
}

// Analysis
const result = await ai.analyze(resumeData, "resume-scoring");
console.log(result.score, result.insights);

// Custom instance
const customAI = createAIEngine({
  primaryProvider: 'gemini',
  apiKeys: { gemini: 'your-key' },
  fallbackEnabled: true,
  costTracking: true,
});
```

---

### 3. `@repo/auth` - Authentication Service

**Location:** `packages/auth/`

Multi-tenant authentication with:
- **Supabase Auth** integration
- **JWT** token management
- Role-Based Access Control (RBAC)
- OAuth support (Google, GitHub, Azure)

**Features:**
- Sign up/in/out with organization context
- Session management
- Multi-tenant verification
- Permission checking (hasPermission, hasAnyPermission, hasAllPermissions)
- Password reset/update
- Express/Next.js middleware

**Usage:**
```typescript
import { createAuthService, withAuth } from '@repo/auth';

const auth = createAuthService({
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_KEY!,
  jwtSecret: process.env.JWT_SECRET,
});

// Sign up
const { user, session } = await auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  organizationId: 'org-uuid',
  role: 'employee',
});

// Sign in
const { user, session } = await auth.signIn({
  email: 'user@example.com',
  password: 'secure-password',
});

// Check permissions
if (auth.hasPermission(user.role, 'manage:users')) {
  // User can manage users
}

// Middleware
export default withAuth(
  async (req, res) => {
    // req.user is now available
    res.json({ user: req.user });
  },
  { requiredRole: 'manager', requiredPermission: 'view:analytics' }
);
```

---

### 4. `@repo/api` - tRPC API Client

**Location:** `packages/api-client/`

Type-safe API client using tRPC with:
- **React Query** hooks
- **Zod** schema validation
- **SuperJSON** transformer
- Routers for all 7 applications

**Routers:**
- `punchClock` - Employee management, time tracking
- `waiterAi` - Restaurant orders, menu analytics
- `flairAi` - Resume scoring, recruitment
- `artisanAi` - Design projects, AI generation
- `sereneAi` - Wellness bookings, analytics

**Usage (React):**
```typescript
import { trpc } from '@repo/api/client';

function EmployeeList({ orgId }: { orgId: string }) {
  // Type-safe query
  const { data, isLoading } = trpc.punchClock.getEmployees.useQuery({ orgId });
  
  // Type-safe mutation
  const createEmployee = trpc.punchClock.createEmployee.useMutation({
    onSuccess: () => {
      // Refresh list
    },
  });
  
  return (
    <div>
      {data?.employees.map(emp => (
        <div key={emp.id}>{emp.firstName} {emp.lastName}</div>
      ))}
    </div>
  );
}
```

**Usage (Server):**
```typescript
import { appRouter, createCallerFactory } from '@repo/api/server';

const createCaller = createCallerFactory(appRouter);

const caller = createCaller({
  userId: 'user-id',
  organizationId: 'org-id',
  role: 'admin',
});

const health = await caller.health({ service: 'punchClock' });
```

---

## 🚀 Building

All packages can be built using:

```bash
# From root
pnpm run build

# Individual package
cd packages/shared-ui
pnpm run build
```

## 🧪 Type Checking

```bash
# From root
pnpm run type-check

# Individual package
cd packages/ai-engine
pnpm run type-check
```

## 📝 Development

All packages support watch mode for development:

```bash
cd packages/shared-ui
pnpm run dev
```

## 🔧 Configuration

- **TypeScript:** All packages use `@repo/tsconfig` base configuration
- **ESLint:** All packages use `@repo/eslint-config`
- **Build:** All packages use `tsup` for building with CJS/ESM dual output

## 📚 Documentation

Each package includes comprehensive TypeScript types that serve as documentation. All exports are properly typed for IntelliSense support in your IDE.

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** November 2025
