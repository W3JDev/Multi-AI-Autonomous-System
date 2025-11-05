# Ai-Artisan - AI-Powered Resume Builder

**Part of W3JDev AI Ecosystem**

## Overview

Ai-Artisan is a comprehensive AI-powered resume builder designed to help job seekers create professional, ATS-optimized resumes with intelligent assistance.

## Features

### 1. **Resume Builder**
- Interactive resume editor with sections for:
  - Personal Information (name, contact, links)
  - Professional Summary
  - Work Experience (multiple positions)
  - Education (multiple degrees)
  - Skills (comma-separated)
  - Certifications (optional)
  - Projects (optional)
- Real-time preview
- Multiple professional templates (Modern, Classic, Minimal, Creative, Professional)

### 2. **ATS Optimization**
- Analyzes resume for ATS compatibility
- Provides score out of 100
- Identifies:
  - Matched keywords from job description
  - Missing keywords
  - Format issues
  - Keyword density
- Actionable suggestions for improvement

### 3. **Cover Letter Generator**
- AI-powered cover letter generation
- Customizable tone (Professional, Casual, Enthusiastic)
- Job-specific tailoring
- Editable output
- Download as text file

### 4. **Job Matching**
- AI-powered job recommendations
- Match scoring based on resume
- Identifies:
  - Matching skills
  - Missing skills (skill gaps)
  - Match reasons
- Job application tracking

### 5. **PDF Export**
- Professional PDF generation
- Multiple template options
- Clean, ATS-friendly formatting
- Download directly to device

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Database**: Prisma (via @repo/database)
- **AI**: Google Gemini (via @repo/ai)
- **Auth**: Supabase (via @repo/auth)

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

```bash
# From monorepo root
pnpm install

# Build dependencies
pnpm build --filter="./packages/*"

# Run Ai-Artisan in development
pnpm dev --filter=@ecosystem/ai-artisan
```

The app will be available at `http://localhost:3005`

### Build for Production

```bash
# From monorepo root
pnpm build --filter=@ecosystem/ai-artisan

# Start production server
pnpm start --filter=@ecosystem/ai-artisan
```

## Project Structure

```
apps/ai-artisan/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/                  # Dashboard
│   │   └── page.tsx
│   ├── resumes/
│   │   ├── new/                    # Create new resume
│   │   │   └── page.tsx
│   │   ├── [id]/                   # Edit resume (future)
│   │   └── [id]/analyze/           # ATS analysis (future)
│   ├── cover-letters/
│   │   └── generate/               # Generate cover letter
│   │       └── page.tsx
│   ├── jobs/
│   │   ├── search/                 # Job search
│   │   │   └── page.tsx
│   │   └── applications/           # Track applications (future)
│   └── api/                        # API routes (future)
│       ├── resumes/
│       ├── ai/
│       └── jobs/
├── components/
│   ├── ResumeEditor/
│   │   ├── ResumeEditor.tsx        # Main editor component
│   │   ├── ResumePreview.tsx       # Live preview
│   │   ├── ATSScoreDisplay.tsx     # ATS analysis display
│   │   └── index.ts
│   └── ui.tsx                      # Shared UI components
├── lib/
│   ├── types.ts                    # TypeScript types
│   ├── ats-analyzer.ts             # ATS analysis logic
│   └── pdf-generator.ts            # PDF generation
└── package.json
```

## Core Components

### ResumeEditor
Interactive form for editing resume content with sections for personal info, experience, education, and skills.

### ResumePreview
Real-time preview of the resume with professional formatting.

### ATSScoreDisplay
Visual display of ATS compatibility score with:
- Overall score gauge
- Keyword analysis
- Missing keywords
- Improvement suggestions

## Utilities

### ATS Analyzer (`lib/ats-analyzer.ts`)
- `analyzeATS()` - Analyzes resume for ATS compatibility
- `optimizeResumeForJob()` - AI-powered resume optimization

### PDF Generator (`lib/pdf-generator.ts`)
- `generateResumePDF()` - Creates PDF from resume data
- `downloadPDF()` - Downloads PDF to user's device
- Multiple template support

## Database Schema

Uses shared Prisma schema from `@repo/database`:

```prisma
model Resume {
  id             String   @id @default(uuid())
  organizationId String
  userId         String
  title          String
  content        Json
  rawText        String?
  aiOptimized    Boolean  @default(false)
  atsScore       Int?
  targetJob      String?
  keywords       String[]
  template       String   @default("modern")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  organization    Organization
  user            User
  coverLetters    CoverLetter[]
  jobApplications JobApplication[]
}

model CoverLetter {
  id             String   @id @default(uuid())
  resumeId       String
  jobTitle       String
  company        String
  jobDescription String?
  content        String
  tone           String   @default("professional")
  createdAt      DateTime @default(now())
  
  resume Resume
}

model JobApplication {
  id         String            @id @default(uuid())
  userId     String
  resumeId   String
  company    String
  position   String
  status     ApplicationStatus @default(DRAFT)
  appliedAt  DateTime?
  notes      String?
  createdAt  DateTime @default(now())
  
  user   User
  resume Resume
}
```

## Features Not Yet Implemented

- [ ] API routes for CRUD operations
- [ ] Authentication integration
- [ ] Database persistence (currently using localStorage for drafts)
- [ ] Resume templates implementation (only Modern template fully working)
- [ ] Resume editing (edit existing resumes)
- [ ] Job application tracking
- [ ] Cover letter history
- [ ] AI-powered content suggestions
- [ ] Real-time AI integration (currently mock)

## Deployment

Optimized for Vercel deployment:

```bash
# Deploy to Vercel
vercel --cwd apps/ai-artisan
```

## Environment Variables

Create `.env.local` in the app directory:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."

# AI Services
GEMINI_API_KEY="your_gemini_key"

# Auth
NEXTAUTH_URL="http://localhost:3005"
NEXTAUTH_SECRET="your_secret"
```

## License

Part of W3JDev AI Ecosystem - MIT License

## Contributing

This is a monorepo application. Follow the monorepo contribution guidelines.
