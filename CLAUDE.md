# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WApp is a modern fullstack Next.js 15 application built with Clean Architecture principles, featuring complete authentication (email/phone + OAuth), mobile-ready design with Capacitor support, and centralized configuration for easy backend migration.

**Tech Stack**: Next.js 15 (App Router), React 19, TypeScript, Prisma (PostgreSQL), NextAuth v5, Tailwind CSS, shadcn/ui, Capacitor 6, next-intl

**Node Requirements**: Node.js 18+, npm 9+

## Development Commands

```bash
# Development
npm run dev                 # Start dev server on http://localhost:3000

# Build & Production
npm run build              # Generate Prisma client + build for production
npm start                  # Start production server

# Linting
npm run lint               # Run Next.js linter

# Database (Prisma)
npm run db:generate        # Generate Prisma client (auto-runs on postinstall)
npm run db:push           # Push schema to database (development)
npm run db:migrate        # Create and run migration (production)
npm run db:studio         # Open Prisma Studio GUI for database

# Mobile (Capacitor)
npx cap add android       # Add Android platform (one-time)
npx cap add ios          # Add iOS platform (one-time)
npx cap sync             # Sync web code to native platforms
npx cap open android     # Open Android Studio
npx cap open ios         # Open Xcode (macOS only)
```

## Clean Architecture Structure

This project strictly follows Clean Architecture with four distinct layers:

### 1. Domain Layer (`src/domain/`)
Pure business logic, no external dependencies. Contains:
- **types/**: TypeScript interfaces and types for domain entities
- **entities/**: Domain entities (if needed)
- **enums/**: Business enumerations

### 2. Application Layer (`src/application/`)
Business logic orchestration. Contains:
- **services/**: Business services (e.g., `auth.service.ts`)
- **use-cases/**: Specific use case implementations

### 3. Infrastructure Layer (`src/infrastructure/`)
Technical implementation details. Contains:
- **config/app.config.ts**: **CRITICAL** - ALL app configuration centralized here
- **database/**: Prisma client setup
- **lib/**: External library adapters (NextAuth, utils)
- **utils/**: Technical utilities (validation schemas, crypto)

### 4. Presentation Layer (`src/presentation/` & `src/app/`)
UI and user interaction. Contains:
- **components/**: React components (ui/, auth/, layout/)
- **hooks/**: Custom React hooks
- **providers/**: Context providers
- **app/**: Next.js App Router pages and API routes

**IMPORTANT**: Never bypass layers. Components should call Application services, not Infrastructure directly.

## Critical Configuration Files

### Centralized Configuration (`src/infrastructure/config/app.config.ts`)
**This is the single source of truth for ALL app configuration.** Never hardcode values in code.

Key configuration sections:
- `api.baseUrl`: Base URL for API calls (change here to migrate backend)
- `auth`: Authentication settings (OAuth toggles, password rules, session config)
- `routes`: Public/protected routes, redirect URLs
- `database`: Database connection
- `email`/`sms`: Communication settings
- `capacitor`: Mobile app configuration
- `security`: CORS, rate limiting

**To migrate backend**: Change `API_BASE_URL` env var or `api.baseUrl` in this file.

### NextAuth Configuration (`src/infrastructure/lib/auth.ts`)
- NextAuth v5 (beta) setup with JWT sessions
- Providers: Credentials (email/phone), Google OAuth, Facebook OAuth
- OAuth providers are **conditionally enabled** based on `app.config.ts`
- Session helpers: `getSession()`, `getCurrentUser()`, `isAuthenticated()`

### Prisma Schema (`prisma/schema.prisma`)
Database models:
- **User**: Main user model with email/phone support
- **Account**: OAuth accounts (NextAuth)
- **Session**: Session tracking (NextAuth)
- **VerificationCode**: Email/phone verification and password reset codes
- **Enums**: AccountType, VerificationCodeType, VerificationCodeStatus

**Important**: Always run `npm run db:generate` after schema changes.

### Internationalization (`src/i18n/`)
- Uses `next-intl` for i18n
- Supported locales: `en`, `es` (configured in `src/i18n/config.ts`)
- Messages in `src/i18n/messages/{locale}.json`
- Middleware handles locale routing with `always` prefix strategy
- All routes are prefixed with locale (e.g., `/en/dashboard`, `/es/dashboard`)

## Path Aliases (tsconfig.json)

Always use path aliases instead of relative imports:

```typescript
// ✅ Correct
import { appConfig } from '@/config/app.config'
import { Button } from '@/components/ui/button'
import { loginUser } from '@/application/services/auth.service'

// ❌ Avoid
import { appConfig } from '../../../infrastructure/config/app.config'
```

Key aliases:
- `@/*` → `src/*`
- `@/components/*` → `src/presentation/components/*`
- `@/config/*` → `src/infrastructure/config/*`

## Authentication Flow

### Registration
1. User submits form (`src/presentation/components/auth/register-form.tsx`)
2. API route validates (`src/app/api/register/route.ts`)
3. Service handles business logic (`src/application/services/auth.service.ts`)
4. Password hashed with bcrypt (10 rounds)
5. User stored in database via Prisma
6. Optional: Verification code sent (if enabled in config)

### Login
1. User submits credentials
2. NextAuth Credentials provider validates (`src/infrastructure/lib/auth.ts`)
3. Service verifies password and returns user
4. JWT session created (HTTP-only cookie)
5. User redirected to `/dashboard`

### OAuth (Google/Facebook)
1. OAuth flow handled automatically by NextAuth
2. Conditionally enabled via `app.config.ts`
3. Requires `GOOGLE_CLIENT_ID`/`FACEBOOK_CLIENT_ID` env vars
4. Account linking enabled by default

## Middleware & Routing

### Middleware (`src/middleware.ts`)
Currently implements **internationalization only**:
- Uses `next-intl/middleware`
- Matches all routes except `/api`, `/_next`, static files
- Locale prefix: `always` (all routes require locale)

**Note**: Auth protection is handled at the page level, not in middleware.

### Protected Routes
Protected pages should check authentication:
```typescript
import { auth } from '@/infrastructure/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  // ... page content
}
```

## Database Workflow

### Development
```bash
# After schema changes
npm run db:push          # Push schema without creating migration

# View/edit data
npm run db:studio        # Opens GUI on http://localhost:5555
```

### Production
```bash
# Create migration
npm run db:migrate       # Creates migration file and applies it

# Apply existing migrations
npx prisma migrate deploy
```

**Important**: `db:push` is for dev only. Always use `db:migrate` for production changes.

## Environment Variables

Required variables (see `.env.example`):
```bash
DATABASE_URL="postgresql://..."       # Postgres connection string
NEXTAUTH_URL="http://localhost:3000"  # App URL
NEXTAUTH_SECRET="..."                 # Generate with: openssl rand -base64 32

# Optional OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."

# Optional Email/SMS (for verification codes)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="..."
SMTP_PASSWORD="..."
SMS_API_KEY="..."                     # For phone verification
```

## Mobile Development (Capacitor)

### Initial Setup
```bash
# 1. Copy and configure
cp capacitor.config.example.ts capacitor.config.ts

# 2. Build Next.js
npm run build

# 3. Add platforms
npx cap add android
npx cap add ios

# 4. Sync web assets
npx cap sync
```

### Development Workflow
```bash
# After code changes
npm run build           # Build Next.js
npx cap sync           # Sync to native platforms
npx cap open android   # Open in Android Studio
```

### Important Notes
- Next.js is configured with `output: 'standalone'` for Capacitor
- CORS configured for `capacitor://localhost` and `ionic://localhost`
- Session persistence uses Capacitor Preferences API
- Set `API_BASE_URL` to production backend URL in mobile builds

## Code Style & Conventions

### File Naming
- `kebab-case.ts` - Regular TypeScript files
- `PascalCase.tsx` - React components
- `index.ts` - Barrel exports

### Import Order
1. External libraries (React, Next.js, etc.)
2. Internal imports by layer (Domain → Application → Infrastructure → Presentation)
3. Types
4. Styles

### TypeScript
- Strict mode enabled
- No implicit any
- Always use explicit return types for functions
- Prefer interfaces over types for object shapes

### Validation
- All schemas in `src/infrastructure/utils/validation.ts`
- Use Zod for runtime validation
- Schemas synced with `app.config.ts` password rules

## Key Implementation Details

### Password Security
- Hashed with bcrypt
- Configurable rounds (default: 10) in `app.config.ts`
- Password requirements configurable via `app.config.ts`
- Validation schemas auto-sync with config

### Session Management
- Strategy: JWT (configurable in `app.config.ts`)
- Max age: 30 days (configurable)
- HTTP-only cookies
- Automatic session refresh every 24 hours

### Security Headers
Next.js config includes:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- poweredByHeader: false

### Feature Toggles
Toggle features in `app.config.ts`:
- `auth.registration.allowSelfSignup`: Allow/disallow user registration
- `auth.oauth.google.enabled`: Enable Google OAuth
- `auth.recovery.enabled`: Enable password recovery
- `auth.confirmation.enabled`: Require email/phone verification

## Common Patterns

### Adding a New API Route
```typescript
// src/app/api/my-route/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/lib/auth'

export async function POST(req: NextRequest) {
  // 1. Check authentication if needed
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse and validate request
  const body = await req.json()

  // 3. Call application service
  // 4. Return response
}
```

### Adding a New Service
```typescript
// src/application/services/my-service.ts
import { prisma } from '@/infrastructure/database/prisma'
import { appConfig } from '@/config/app.config'

export async function myBusinessLogic(data: MyInput): Promise<MyOutput> {
  // 1. Validate business rules
  // 2. Interact with database
  // 3. Return domain objects
}
```

### Creating Components
```typescript
// src/presentation/components/my-component.tsx
'use client' // Only if using hooks/client-side features

import { Button } from '@/components/ui/button'
import { myService } from '@/application/services/my-service'

export function MyComponent() {
  // Component implementation
}
```

## Architecture Documentation

Detailed architecture documentation is available in `ARCHITECTURE.md` - refer to it for:
- Detailed layer descriptions
- Design patterns used
- Testing strategy
- Performance optimizations
- Security implementation details

## Migration & Maintenance

### Backend Migration
To migrate to a different backend server:
1. Set `API_BASE_URL` environment variable, OR
2. Edit `api.baseUrl` in `src/infrastructure/config/app.config.ts`

All API calls will automatically use the new URL.

### Database Migration
1. Change `DATABASE_URL` in `.env`
2. Update `prisma/schema.prisma` if needed
3. Run `npm run db:migrate` for production

### Changing UI Framework
Replace components in `src/presentation/components/ui/` while maintaining interfaces. Business logic remains unchanged.
