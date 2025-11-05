# @repo/database

Unified database layer for the W3JDev AI Ecosystem using Prisma ORM and PostgreSQL.

## Features

- 🏢 **Multi-tenant architecture** - Secure data isolation by organization
- 🔐 **Row-Level Security** - Supabase RLS policies included
- 📊 **25+ data models** - All 6 applications consolidated
- 🔄 **Cross-app queries** - Seamless data sharing
- 📝 **Type-safe** - Auto-generated TypeScript types
- 🌱 **Seed data** - Demo organization with sample data

## Applications Included

- **PUNCH-CLOCK** - HR & Attendance Management
- **WaiterAi** - Restaurant Service Management
- **GuestAi** - Customer Assistant (shared with WaiterAi)
- **FlairAi** - Staff Training Platform
- **Ai-Artisan** - AI Resume Builder
- **Serene-AI** - Spa & Salon Management

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/w3jdev_ecosystem"
DIRECT_DATABASE_URL="postgresql://user:password@localhost:5432/w3jdev_ecosystem"
```

### 3. Generate Prisma Client

```bash
pnpm db:generate
```

### 4. Push Schema to Database

For development (without migrations):

```bash
pnpm db:push
```

For production (with migrations):

```bash
pnpm db:migrate
```

### 5. Seed Demo Data

```bash
pnpm db:seed
```

This creates:
- 1 demo organization: "W3JDev Demo"
- 3 users (owner, admin, member)
- Sample data for all 6 applications

## Usage

### Import in Your Application

```typescript
import { db, Plan, UserRole } from '@repo/database';

// Query with type safety
const employees = await db.employee.findMany({
  where: {
    organizationId: currentOrgId,
    status: 'ACTIVE',
  },
  include: {
    user: true,
    attendances: {
      take: 5,
      orderBy: { checkInTime: 'desc' },
    },
  },
});
```

### Available Models

**Core Models:**
- `Organization` - Multi-tenant root
- `User` - User accounts with roles
- `Subscription` - Billing plans

**PUNCH-CLOCK:**
- `Employee`, `Attendance`, `Shift`, `Leave`, `Payroll`

**Restaurant (WaiterAi/GuestAi):**
- `Restaurant`, `Menu`, `MenuItem`, `Table`, `Order`, `OrderItem`

**FlairAi:**
- `TrainingProgram`, `StaffMember`, `TrainingSession`, `Assessment`

**Ai-Artisan:**
- `Resume`, `CoverLetter`, `JobApplication`

**Serene-AI:**
- `SpaService`, `Appointment`

**Shared:**
- `Notification`, `AuditLog`

### Example Queries

#### Get Active Orders with Items

```typescript
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

#### Create Employee with Attendance

```typescript
const employee = await db.employee.create({
  data: {
    organizationId: currentOrgId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    position: 'Developer',
    department: 'Engineering',
    employmentType: 'FULL_TIME',
    salary: 75000,
  },
});

const attendance = await db.attendance.create({
  data: {
    employeeId: employee.id,
    checkInTime: new Date(),
    method: 'PIN',
    status: 'PRESENT',
  },
});
```

#### Track Training Progress

```typescript
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

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema to DB (dev) |
| `pnpm db:migrate` | Create & apply migration |
| `pnpm db:migrate:deploy` | Deploy migrations (prod) |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm build` | Build package |
| `pnpm type-check` | Type check code |

## Multi-Tenancy

All data is scoped by `organizationId`. **Always** include this in queries:

```typescript
// ✅ Correct
const data = await db.employee.findMany({
  where: {
    organizationId: currentOrgId,
    status: 'ACTIVE',
  },
});

// ❌ Wrong - potential data leak!
const data = await db.employee.findMany({
  where: {
    status: 'ACTIVE',
  },
});
```

## Row-Level Security

For Supabase deployments, apply RLS policies:

```bash
psql $DATABASE_URL < supabase/rls-policies.sql
```

This enables:
- Organization-based data isolation
- Role-based access control
- User self-service permissions

## Migrations

### From Existing Databases

Three migration scripts are provided:

1. **PUNCH-CLOCK**: `tsx migrations/punch-clock-migration.ts`
2. **WaiterAi**: `tsx migrations/waiter-ai-migration.ts`
3. **FlairAi**: `psql $DATABASE_URL < migrations/flair-ai-migration.sql`

### Create New Migration

```bash
pnpm db:migrate
# Enter migration name when prompted
```

## Performance Tips

1. **Use selective includes** - Only fetch needed relations
2. **Add indexes** - Schema includes strategic indexes
3. **Paginate results** - Use `take` and `skip` for large datasets
4. **Filter early** - Always filter by `organizationId` first

## Documentation

See [docs/database/schema-design.md](../../docs/database/schema-design.md) for:
- Detailed architecture overview
- Entity relationship diagrams
- Query optimization guide
- Best practices
- Troubleshooting

## Support

For issues or questions, refer to:
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Maintained by**: W3JDev Team  
**License**: MIT
