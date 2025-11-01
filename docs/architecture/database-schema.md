# Database Schema

## Overview

The W3JDev AI Ecosystem uses a shared PostgreSQL database with multi-tenant architecture.

## Schema Design

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  tenant_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

#### Tenants
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Application-Specific Tables

#### PUNCH-CLOCK
- `attendance_records`: Time tracking
- `leave_requests`: Leave management
- `shifts`: Shift scheduling
- `departments`: Department structure

#### FlairAi
- `training_modules`: Course content
- `user_progress`: Learning progress
- `certifications`: Earned certificates
- `assessments`: Quiz/test results

#### WaiterAi
- `orders`: Customer orders
- `tables`: Restaurant tables
- `menu_items`: Menu catalog
- `reservations`: Table bookings

#### GuestAi
- `conversations`: Chat history
- `tickets`: Support tickets
- `knowledge_base`: FAQ/Help articles
- `feedback`: User feedback

#### Serene-AI
- `appointments`: Booking records
- `services`: Service catalog
- `clients`: Client profiles
- `inventory`: Product inventory

#### Ai-Artisan
- `resumes`: Resume documents
- `templates`: Resume templates
- `portfolios`: Portfolio items
- `exports`: Generated files

## Multi-Tenancy Strategy

All tables include `tenant_id` for data isolation:

```sql
-- Row Level Security (RLS)
CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

## Indexes

Performance-critical indexes:

```sql
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_attendance_date ON attendance_records(date, tenant_id);
CREATE INDEX idx_orders_status ON orders(status, tenant_id);
```

## Relationships

```
tenants (1) ←→ (many) users
tenants (1) ←→ (many) attendance_records
tenants (1) ←→ (many) orders
tenants (1) ←→ (many) appointments
```

## Migrations

Using Prisma Migrate:

```bash
# Create migration
pnpm --filter=@repo/db migrate:create

# Apply migration
pnpm --filter=@repo/db migrate:deploy

# Reset database
pnpm --filter=@repo/db migrate:reset
```

## Backup Strategy

- Daily automated backups
- Point-in-time recovery
- Cross-region replication
- 30-day retention policy

## Future Schema Extensions

- Audit logging
- Data versioning
- Soft deletes
- Full-text search
