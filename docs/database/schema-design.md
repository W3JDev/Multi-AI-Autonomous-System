# Database Schema Design

## Overview

The W3JDev AI Ecosystem uses a **unified PostgreSQL database** with **Prisma ORM** that consolidates all 6 applications into a single, coherent data model. This approach provides:

- **Centralized data management** - Single source of truth for all applications
- **Multi-tenant isolation** - Secure data separation by organization
- **Cross-application queries** - Seamless data sharing between apps
- **Type safety** - Auto-generated TypeScript types
- **Performance optimization** - Strategic indexes and relationships

## Architecture

### Multi-Tenancy Approach

We implement **row-level multi-tenancy** using the `organizationId` field:

```
┌─────────────────┐
│  Organization   │
│   (Root)        │
└────────┬────────┘
         │
         ├──► Users
         ├──► Employees (PUNCH-CLOCK)
         ├──► Restaurants (WaiterAi)
         ├──► Training Programs (FlairAi)
         ├──► Resumes (Ai-Artisan)
         └──► Spa Services (Serene-AI)
```

**Key Principles:**
1. Every table (except `Organization`) has an `organizationId` foreign key
2. All queries are scoped to the current organization
3. Row-Level Security (RLS) enforces isolation at the database level
4. Users cannot access data from other organizations

### Data Isolation Strategy

**Three-Layer Security:**

1. **Application Layer**: Prisma middleware filters by `organizationId`
2. **Database Layer**: RLS policies enforce organization boundaries
3. **API Layer**: Authentication validates organization membership

## Core Models

### Organization

The root entity for multi-tenancy.

```typescript
model Organization {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  plan      Plan     @default(FREE)
  status    OrganizationStatus @default(ACTIVE)
  settings  Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Fields:**
- `slug` - URL-friendly identifier (e.g., "acme-corp")
- `plan` - Subscription tier (FREE, STARTER, PRO, ENTERPRISE)
- `settings` - Organization-specific configuration

### User

User accounts with role-based access control.

```typescript
model User {
  id             String   @id @default(uuid())
  organizationId String
  email          String   @unique
  name           String?
  role           UserRole @default(MEMBER)
  status         UserStatus @default(ACTIVE)
}
```

**Roles:**
- `OWNER` - Full access, billing management
- `ADMIN` - Manage users and data
- `MANAGER` - Limited administrative access
- `MEMBER` - Standard user access
- `VIEWER` - Read-only access

## Application-Specific Models

### PUNCH-CLOCK (HR & Attendance)

**Entity Relationships:**
```
Employee ──┬──► Attendance (many)
           ├──► Shift (many)
           ├──► Leave (many)
           └──► Payroll (many)
```

**Key Models:**
- `Employee` - Staff members with employment details
- `Attendance` - Time tracking records (check-in/out)
- `Shift` - Work schedules
- `Leave` - Time-off requests
- `Payroll` - Salary processing

**Example Query:**
```typescript
// Get attendance for all employees this month
const attendance = await db.attendance.findMany({
  where: {
    employee: {
      organizationId: currentOrgId,
    },
    checkInTime: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
  },
  include: {
    employee: true,
  },
});
```

### WaiterAi + GuestAi (Restaurant Management)

**Entity Relationships:**
```
Restaurant ──┬──► Menu (many) ──► MenuItem (many)
             ├──► Table (many)
             └──► Order (many) ──► OrderItem (many)
```

**Key Features:**
- Multi-language menu support (`translations` JSON field)
- AI-generated descriptions (`aiDescription`)
- Dietary restrictions and allergens
- Real-time table status management

**Example Query:**
```typescript
// Get active orders with items
const activeOrders = await db.order.findMany({
  where: {
    restaurant: {
      organizationId: currentOrgId,
    },
    status: {
      in: ['CONFIRMED', 'PREPARING'],
    },
  },
  include: {
    items: {
      include: {
        menuItem: true,
      },
    },
    table: true,
  },
});
```

### FlairAi (Training Platform)

**Entity Relationships:**
```
TrainingProgram ──► TrainingSession ──► Assessment
StaffMember ─────┬──► TrainingSession
                 └──► Assessment
```

**Key Features:**
- Scenario-based training (stored as JSON)
- Performance tracking
- Multi-language support
- Skill level progression

**Example Query:**
```typescript
// Get training progress for a staff member
const progress = await db.trainingSession.findMany({
  where: {
    staffId: staffMemberId,
    completed: true,
  },
  include: {
    program: true,
    assessments: true,
  },
  orderBy: {
    startTime: 'desc',
  },
});
```

### Ai-Artisan (Resume Builder)

**Entity Relationships:**
```
Resume ──┬──► CoverLetter (many)
         └──► JobApplication (many)
```

**Key Features:**
- ATS score calculation
- AI optimization
- Keyword extraction
- Template management
- Application tracking

**Example Query:**
```typescript
// Get user's resumes with applications
const resumes = await db.resume.findMany({
  where: {
    userId: currentUserId,
  },
  include: {
    coverLetters: true,
    jobApplications: {
      orderBy: {
        appliedAt: 'desc',
      },
    },
  },
});
```

### Serene-AI (Spa & Salon)

**Entity Relationships:**
```
SpaService ──► Appointment (many)
```

**Key Features:**
- Service categorization
- Duration-based scheduling
- Customer management
- Booking status tracking

**Example Query:**
```typescript
// Get today's appointments
const todayAppointments = await db.appointment.findMany({
  where: {
    service: {
      organizationId: currentOrgId,
    },
    appointmentDate: {
      gte: startOfDay,
      lte: endOfDay,
    },
  },
  include: {
    service: true,
  },
  orderBy: {
    appointmentDate: 'asc',
  },
});
```

## Shared Models

### Notification

Cross-application notification system.

```typescript
model Notification {
  id             String   @id @default(uuid())
  organizationId String
  userId         String
  title          String
  message        String
  type           NotificationType
  read           Boolean  @default(false)
  link           String?  // Deep link to related resource
}
```

### AuditLog

Activity tracking for compliance and debugging.

```typescript
model AuditLog {
  id             String   @id @default(uuid())
  organizationId String
  userId         String?
  action         String   // CREATE, UPDATE, DELETE, etc.
  entity         String   // Table/model name
  entityId       String?
  changes        Json?    // Before/after snapshot
  ipAddress      String?
  userAgent      String?
}
```

## Indexes & Performance

### Strategic Indexing

Every table includes optimized indexes for common queries:

```prisma
// Organization-scoped queries
@@index([organizationId])

// User lookups
@@index([email])
@@index([status])

// Time-based queries
@@index([createdAt])
@@index([checkInTime])
@@index([appointmentDate])

// Composite indexes for complex queries
@@index([organizationId, status])
@@index([restaurantId, isAvailable])
```

### Query Optimization Tips

1. **Always filter by organizationId first**
   ```typescript
   // ✅ Good
   where: {
     organizationId: currentOrgId,
     status: 'ACTIVE',
   }
   
   // ❌ Bad - missing organization filter
   where: {
     status: 'ACTIVE',
   }
   ```

2. **Use selective includes**
   ```typescript
   // ✅ Good - only needed relations
   include: {
     items: {
       select: {
         id: true,
         quantity: true,
       },
     },
   }
   
   // ❌ Bad - fetches everything
   include: {
     items: true,
   }
   ```

3. **Paginate large result sets**
   ```typescript
   const results = await db.order.findMany({
     take: 20,
     skip: page * 20,
     orderBy: { createdAt: 'desc' },
   });
   ```

## Cross-Application Queries

One of the key benefits of the unified schema is seamless data sharing:

### Example: Employee Training Dashboard

```typescript
// Get employee with their training progress
const employeeWithTraining = await db.employee.findUnique({
  where: { id: employeeId },
  include: {
    user: {
      include: {
        staffMember: {
          include: {
            trainingSessions: {
              include: {
                program: true,
                assessments: true,
              },
            },
          },
        },
      },
    },
  },
});
```

### Example: Unified Analytics

```typescript
// Get organization-wide stats
const [
  totalEmployees,
  activeOrders,
  completedTrainings,
  upcomingAppointments
] = await Promise.all([
  db.employee.count({ where: { organizationId } }),
  db.order.count({ where: { restaurant: { organizationId }, status: 'CONFIRMED' } }),
  db.trainingSession.count({ where: { staff: { organizationId }, completed: true } }),
  db.appointment.count({ 
    where: { 
      service: { organizationId },
      status: 'SCHEDULED',
      appointmentDate: { gte: new Date() },
    },
  }),
]);
```

## Row-Level Security (RLS)

### Supabase RLS Policies

Applied via `supabase/rls-policies.sql`:

**Organization Isolation:**
```sql
CREATE POLICY "Users can view org data"
  ON employees FOR SELECT
  USING (organization_id = auth.user_organization_id());
```

**Role-Based Access:**
```sql
CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );
```

**Self-Service:**
```sql
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());
```

## Migration Guide

### From Existing Databases

Three migration scripts are provided:

1. **PUNCH-CLOCK**: `migrations/punch-clock-migration.ts`
   - Migrates from existing PostgreSQL/Prisma database
   - Preserves all employee and attendance data

2. **WaiterAi**: `migrations/waiter-ai-migration.ts`
   - Converts from Drizzle ORM to Prisma
   - Handles JSON translations properly

3. **FlairAi**: `migrations/flair-ai-migration.sql`
   - SQL script for Supabase migration
   - Uses dblink for cross-database queries

### Migration Steps

1. **Backup existing data**
   ```bash
   pg_dump $OLD_DATABASE_URL > backup.sql
   ```

2. **Set up new database**
   ```bash
   pnpm db:migrate
   ```

3. **Run migration script**
   ```bash
   tsx migrations/punch-clock-migration.ts
   ```

4. **Verify data integrity**
   ```bash
   pnpm db:studio
   ```

5. **Apply RLS policies**
   ```bash
   psql $DATABASE_URL < supabase/rls-policies.sql
   ```

## Development Workflow

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Generate Prisma client
pnpm db:generate

# 4. Push schema to database
pnpm db:push

# 5. Seed demo data
pnpm db:seed
```

### Common Commands

```bash
# Generate Prisma client
pnpm db:generate

# Create migration
pnpm db:migrate

# Deploy migrations
pnpm db:migrate:deploy

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio

# Push schema without migration
pnpm db:push
```

### Schema Changes

1. **Modify `schema.prisma`**
2. **Generate migration**
   ```bash
   pnpm db:migrate
   ```
3. **Update seed data if needed**
4. **Test in development**
5. **Deploy to production**
   ```bash
   pnpm db:migrate:deploy
   ```

## Type Safety

Prisma auto-generates TypeScript types for all models:

```typescript
import { db, Organization, User, Employee } from '@repo/database';

// Type-safe queries
const employee: Employee = await db.employee.findUnique({
  where: { id: employeeId },
});

// Type-safe includes
const user = await db.user.findUnique({
  where: { id: userId },
  include: {
    organization: true,  // Organization type included
    employee: true,      // Employee | null
  },
});

// Type-safe creates
const newOrder = await db.order.create({
  data: {
    restaurantId: '...',
    total: 50.00,      // Type: Decimal
    status: 'PENDING', // Enum type-checked
  },
});
```

## Best Practices

### 1. Always Scope by Organization

```typescript
// ✅ Correct
const employees = await db.employee.findMany({
  where: {
    organizationId: currentOrgId,
    status: 'ACTIVE',
  },
});

// ❌ Incorrect - potential data leak
const employees = await db.employee.findMany({
  where: {
    status: 'ACTIVE',
  },
});
```

### 2. Use Transactions for Multi-Step Operations

```typescript
const result = await db.$transaction(async (tx) => {
  const order = await tx.order.create({ /* ... */ });
  
  await tx.orderItem.createMany({
    data: items.map(item => ({
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
    })),
  });
  
  return order;
});
```

### 3. Implement Soft Deletes

For audit compliance, use status fields instead of deleting:

```typescript
// ✅ Soft delete
await db.employee.update({
  where: { id: employeeId },
  data: { status: 'INACTIVE' },
});

// ❌ Hard delete - loses audit trail
await db.employee.delete({
  where: { id: employeeId },
});
```

### 4. Log Important Actions

```typescript
async function createEmployee(data: EmployeeInput, userId: string) {
  const employee = await db.employee.create({ data });
  
  await db.auditLog.create({
    data: {
      organizationId: data.organizationId,
      userId,
      action: 'CREATE',
      entity: 'employee',
      entityId: employee.id,
      changes: data,
    },
  });
  
  return employee;
}
```

### 5. Use Prisma Middleware for Common Logic

```typescript
// Apply organizationId automatically
db.$use(async (params, next) => {
  if (params.action === 'create' && params.args.data) {
    if (!params.args.data.organizationId && currentOrgId) {
      params.args.data.organizationId = currentOrgId;
    }
  }
  return next(params);
});
```

## Troubleshooting

### Common Issues

**Issue: "organizationId is required"**
```typescript
// Solution: Always include organizationId
await db.employee.create({
  data: {
    organizationId: currentOrgId, // ← Required
    firstName: 'John',
    // ...
  },
});
```

**Issue: Slow queries**
```bash
# Enable query logging
DATABASE_URL="...?connection_limit=5&pool_timeout=2"

# Check execution plan
EXPLAIN ANALYZE SELECT ...
```

**Issue: RLS blocking queries**
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'employees';

-- Temporarily disable RLS (development only)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
```

## Future Enhancements

- **Full-text search** using PostgreSQL's `tsvector`
- **Data versioning** for complete audit history
- **Automated backups** with point-in-time recovery
- **Read replicas** for query performance
- **Sharding** for horizontal scaling

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Design Principles](https://www.postgresql.org/docs/current/ddl.html)

---

**Last Updated**: November 2024  
**Maintained by**: W3JDev Team
