# W3JDev AI Ecosystem 🚀

Unified monorepo for 6 AI-powered applications built with Turborepo.

## 📋 Applications

| Application | Description | Port |
|------------|-------------|------|
| **PUNCH-CLOCK** | HR & Attendance Management | 3000 |
| **FlairAi** | Staff Training & Development | 3001 |
| **WaiterAi** | Restaurant Service Management | 3002 |
| **GuestAi** | Customer Assistant & Support | 3003 |
| **Serene-AI** | Spa & Salon Management | 3004 |
| **Ai-Artisan** | AI-Powered Resume Builder | 3005 |
| **Unified Dashboard** | Control Center | 3006 |

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run setup script
pnpm setup

# Start all applications in development mode
pnpm dev

# Build all applications
pnpm build

# Lint all code
pnpm lint

# Type check all code
pnpm type-check
```

## 🏗️ Architecture

```
W3JDev-AI-Ecosystem/
├── apps/
│   ├── punch-clock/          # HR & Attendance
│   ├── flair-ai/             # Staff Training
│   ├── waiter-ai/            # Restaurant Service
│   ├── guest-ai/             # Customer Assistant
│   ├── serene-ai/            # Spa/Salon
│   ├── ai-artisan/           # Resume Builder
│   └── unified-dashboard/    # Control Center
├── packages/
│   ├── shared-ui/            # Component library
│   ├── ai-engine/            # Gemini + DeepSeek
│   ├── auth/                 # Multi-tenant auth
│   ├── database/             # Prisma schemas
│   ├── api-client/           # tRPC SDK
│   ├── config/               # Shared configs
│   │   ├── tsconfig/         # TypeScript configs
│   │   ├── eslint/           # ESLint configs
│   │   └── prettier/         # Prettier configs
│   └── utils/                # Common utilities
├── infrastructure/
│   ├── docker/
│   └── github-actions/
├── docs/
│   ├── architecture/
│   ├── agent-personas/
│   └── user-guides/
└── scripts/
```

## 💻 Tech Stack

- **Framework**: React 19, Next.js 15
- **Language**: TypeScript 5.7
- **Build**: Turborepo + pnpm
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini + DeepSeek
- **Styling**: Tailwind CSS
- **API**: tRPC

## 📦 Shared Packages

### @repo/ui
Shared UI component library used across all applications.

### @repo/ai
AI engine integrating Google Gemini and DeepSeek models.

### @repo/auth
Multi-tenant authentication and authorization.

### @repo/db
Database layer with Prisma schemas.

### @repo/api
tRPC API client SDK.

### @repo/utils
Common utility functions.

## 🔧 Development

### Working on a specific app
```bash
# Start specific app
pnpm dev --filter=@ecosystem/punch-clock

# Build specific app
pnpm build --filter=@ecosystem/flair-ai

# Lint specific app
pnpm lint --filter=@ecosystem/waiter-ai
```

### Working on packages
```bash
# Lint all packages
pnpm lint --filter="./packages/*"

# Type check all packages
pnpm type-check --filter="./packages/*"
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm test --filter=@ecosystem/guest-ai
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture/overview.md)
- [Database Schema](./docs/architecture/database-schema.md)
- [Agent Personas](./docs/agent-personas/)
- [User Guides](./docs/user-guides/)

## 🔐 Environment Variables

Create `.env.local` files in each app directory:

```env
# Database
DATABASE_URL="postgresql://..."

# AI Services
GEMINI_API_KEY="your_gemini_key"
DEEPSEEK_API_KEY="your_deepseek_key"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret"
```

## 🚢 Deployment

This monorepo is optimized for deployment on Vercel. Each app can be deployed independently.

```bash
# Deploy specific app to Vercel
vercel --cwd apps/punch-clock
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass: `pnpm test`
4. Ensure linting passes: `pnpm lint`
5. Submit a pull request

## 📊 CI/CD

The project uses GitHub Actions for continuous integration. On every PR and push:
- ✅ Build all applications
- ✅ Lint all code
- ✅ Type check all code
- ✅ Run all tests

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Built with ❤️ by W3JDev | Powered by Turborepo & Multi-AI Technology**
