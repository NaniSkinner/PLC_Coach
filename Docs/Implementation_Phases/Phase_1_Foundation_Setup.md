# Phase 1: Foundation & Environment Setup

**Duration:** 1 day (6-8 hours)
**Status:** 🔴 Not Started
**Prerequisites:** Phase 0 complete

---

## 📋 Overview

This phase creates the foundational Next.js application with all necessary configuration, dependencies, and infrastructure. By the end, you'll have a working app deployed to Vercel with a database.

**Why This Phase Matters:**
- Establishes the technical foundation for all future work
- Ensures deployment pipeline works early (fail fast)
- Sets up proper TypeScript configuration and tooling
- Creates database schema for conversation storage

---

## 🎯 Objectives

By the end of this phase, you will have:
- ✅ Working Next.js 14 application with TypeScript
- ✅ Tailwind CSS configured with Solution Tree branding
- ✅ All dependencies installed (Pinecone, OpenAI, LangChain)
- ✅ Database created and schema migrated
- ✅ Application deployed to Vercel
- ✅ Environment variables configured
- ✅ GitHub repository with initial commit

---

## 📝 Tasks

### Task 1.1: Initialize Next.js Project

**Priority:** Critical
**Time Estimate:** 20 minutes

#### Step 1: Create Project Directory

```bash
# Navigate to where you want to create the project
cd ~/dev/Gauntlet/AI_PLC

# Create project directory
mkdir ai-plc-virtual-coach
cd ai-plc-virtual-coach
```

#### Step 2: Initialize Next.js

```bash
# Initialize Next.js with TypeScript, Tailwind, App Router
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Answer the prompts:**
```
✔ Would you like to use TypeScript? › Yes
✔ Would you like to use ESLint? › Yes
✔ Would you like to use Tailwind CSS? › Yes
✔ Would you like to use `src/` directory? › No
✔ Would you like to use App Router? › Yes
✔ Would you like to customize the default import alias? › No
```

#### Step 3: Verify Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

- [ ] Open browser to http://localhost:3000
- [ ] Confirm Next.js welcome page appears
- [ ] No console errors in browser or terminal
- [ ] Stop server with `Ctrl+C`

#### Checklist

- [ ] Next.js 14+ installed
- [ ] TypeScript configured
- [ ] Tailwind CSS working
- [ ] App Router structure created
- [ ] Default page renders successfully
- [ ] No errors in terminal or browser console

**Files Created:**
```
ai-plc-virtual-coach/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .gitignore
└── node_modules/
```

---

### Task 1.2: Install Core Dependencies

**Priority:** Critical
**Time Estimate:** 15 minutes

#### Step 1: Install shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init
```

**Answer the prompts:**
```
✔ Would you like to use TypeScript? › Yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? › app/globals.css
✔ Would you like to use CSS variables for colors? › Yes
✔ Are you using a custom tailwind prefix? › No
✔ Where is your tailwind.config.js located? › tailwind.config.ts
✔ Configure the import alias for components? › @/components
✔ Configure the import alias for utils? › @/lib/utils
✔ Write configuration to components.json? › Yes
```

#### Step 2: Install AI/RAG Dependencies

```bash
# Install Pinecone SDK
npm install @pinecone-database/pinecone

# Install OpenAI SDK
npm install openai

# Install LangChain
npm install langchain @langchain/openai
```

#### Step 3: Install Database Client

```bash
# Install Vercel Postgres client
npm install @vercel/postgres
```

#### Step 4: Install Utility Libraries

```bash
# Install utilities
npm install uuid date-fns zod

# Install dev dependencies for types
npm install -D @types/uuid
```

#### Step 5: Verify All Dependencies

```bash
# Check installed packages
npm list --depth=0
```

**Expected output should include:**
- `@pinecone-database/pinecone`
- `openai`
- `langchain`
- `@langchain/openai`
- `@vercel/postgres`
- `uuid`
- `date-fns`
- `zod`

#### Checklist

- [ ] shadcn/ui initialized (created `components/ui/` folder)
- [ ] Pinecone SDK installed
- [ ] OpenAI SDK installed
- [ ] LangChain installed
- [ ] Vercel Postgres client installed
- [ ] Utility libraries installed
- [ ] No dependency conflicts
- [ ] `package.json` has all dependencies listed

---

### Task 1.3: Environment Variables Configuration

**Priority:** Critical
**Time Estimate:** 10 minutes

#### Step 1: Create .env.local File

```bash
# Create environment file
touch .env.local
```

#### Step 2: Add Environment Variables

Open `.env.local` and add:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...your-key-from-phase-0...

# Pinecone Configuration
PINECONE_API_KEY=...your-key-from-phase-0...
PINECONE_INDEX_NAME=plc-coach-demo
PINECONE_ENVIRONMENT=us-east-1

# Database (Will add after Vercel Postgres setup)
# POSTGRES_URL=
# POSTGRES_PRISMA_URL=
# POSTGRES_URL_NON_POOLING=

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=...generate-this-next...
```

#### Step 3: Generate Session Secret

```bash
# Generate random 32-character string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `SESSION_SECRET` value in `.env.local`

#### Step 4: Verify .gitignore

Check that `.gitignore` includes:

```bash
# Environment variables
.env
.env.local
.env*.local
```

This should already be there from create-next-app.

#### Step 5: Create .env.local.example

```bash
# Create example file
cp .env.local .env.local.example
```

Edit `.env.local.example` and replace actual values with placeholders:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_INDEX_NAME=plc-coach-demo
PINECONE_ENVIRONMENT=us-east-1

# Database (Added after Vercel setup)
# POSTGRES_URL=
# POSTGRES_PRISMA_URL=
# POSTGRES_URL_NON_POOLING=

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=generate-with-crypto-randomBytes
```

#### Checklist

- [ ] `.env.local` created with actual keys
- [ ] `.env.local` added to `.gitignore`
- [ ] OpenAI API key added
- [ ] Pinecone API key added
- [ ] Session secret generated and added
- [ ] `.env.local.example` created (for documentation)

---

### Task 1.4: Project Structure Setup

**Priority:** High
**Time Estimate:** 5 minutes

#### Create Directory Structure

```bash
# Create all directories
mkdir -p app/api/chat
mkdir -p app/api/sessions
mkdir -p app/api/feedback
mkdir -p app/api/auth
mkdir -p app/components
mkdir -p app/lib/rag
mkdir -p app/lib/conversation
mkdir -p app/lib/db
mkdir -p app/lib/utils
mkdir -p app/types
mkdir -p scripts/utils
mkdir -p scripts/knowledge_base
mkdir -p __tests__/unit
mkdir -p __tests__/integration
mkdir -p public/assets
```

#### Preserve Empty Directories

```bash
# Create .gitkeep files so Git tracks empty directories
touch scripts/knowledge_base/.gitkeep
touch public/assets/.gitkeep
touch __tests__/unit/.gitkeep
touch __tests__/integration/.gitkeep
```

#### Verify Structure

```bash
# View directory tree (macOS/Linux)
tree -L 3 -d

# Or just list directories
ls -R
```

#### Checklist

- [ ] All directories created
- [ ] `.gitkeep` files in empty directories
- [ ] Structure matches PRD Section 12.2

---

### Task 1.5: TypeScript Configuration

**Priority:** High
**Time Estimate:** 5 minutes

#### Verify tsconfig.json

Open `tsconfig.json` and ensure it has these settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Key settings to verify:**
- `"strict": true` - Enforces strict type checking
- `"baseUrl": "."` - Allows absolute imports
- `"paths": { "@/*": ["./*"] }` - Import alias configured

#### Test TypeScript

```bash
# Run TypeScript check
npx tsc --noEmit
```

Should show no errors (or only warnings that can be ignored).

#### Checklist

- [ ] `strict` mode enabled
- [ ] Path aliases configured (`@/*`)
- [ ] No TypeScript errors when running `npm run dev`

---

### Task 1.6: Tailwind CSS & Theme Configuration

**Priority:** High
**Time Estimate:** 15 minutes

#### Step 1: Install Animation Plugin

```bash
npm install tailwindcss-animate
```

#### Step 2: Configure Tailwind with Solution Tree Colors

Open `tailwind.config.ts` and replace with:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Solution Tree Brand Colors (from PRD Section 7.1)
        "st-blue-primary": "#0066CC",
        "st-blue-dark": "#004C99",
        "st-blue-light": "#3385D6",
        "st-orange": "#FF6B35",
        "st-green": "#28A745",
        "st-gray": {
          50: "#F8F9FA",
          100: "#E9ECEF",
          300: "#CED4DA",
          700: "#495057",
          900: "#1A1A1A",
        },
        // shadcn/ui default colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

#### Step 3: Test Tailwind Colors

Edit `app/page.tsx` to test colors:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-st-blue-primary">
        AI-Powered PLC Virtual Coach
      </h1>
      <p className="mt-4 text-lg text-st-gray-700">
        Foundation setup in progress...
      </p>
      <div className="mt-8 flex gap-4">
        <div className="h-16 w-16 bg-st-blue-primary rounded" />
        <div className="h-16 w-16 bg-st-orange rounded" />
        <div className="h-16 w-16 bg-st-green rounded" />
      </div>
    </main>
  );
}
```

Run `npm run dev` and verify colors display correctly at http://localhost:3000

#### Checklist

- [ ] `tailwindcss-animate` plugin installed
- [ ] Solution Tree colors added to config
- [ ] shadcn/ui colors preserved
- [ ] Test page displays colors correctly
- [ ] No Tailwind compilation errors

---

### Task 1.7: GitHub Repository Setup

**Priority:** High
**Time Estimate:** 10 minutes

#### Step 1: Initialize Git

```bash
# Initialize git (if not already done)
git init
```

#### Step 2: Create Comprehensive .gitignore

Verify `.gitignore` includes (should already be there from create-next-app):

```
# Environment variables
.env
.env.local
.env*.local

# Dependencies
node_modules/

# Next.js
.next/
out/
build/
dist/

# Testing
coverage/

# IDE
.vscode/
.idea/
*.swp
.DS_Store

# Logs
*.log
```

#### Step 3: Initial Commit

```bash
# Stage all files
git add .

# Create initial commit
git commit -m "Initial setup: Next.js 14 + TypeScript + Tailwind + shadcn/ui"
```

#### Step 4: Connect to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-plc-virtual-coach.git

# Or if using SSH:
git remote add origin git@github.com:YOUR_USERNAME/ai-plc-virtual-coach.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

#### Checklist

- [ ] Git initialized
- [ ] `.gitignore` comprehensive
- [ ] Initial commit created
- [ ] GitHub remote added
- [ ] Code pushed to GitHub
- [ ] Repository accessible at GitHub URL

---

### Task 1.8: Vercel Project Setup

**Priority:** Critical
**Time Estimate:** 20 minutes

#### Step 1: Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
# Login (will open browser)
vercel login
```

Follow browser prompts to authenticate.

#### Step 3: Link Project

```bash
# Link to Vercel
vercel link
```

**Answer the prompts:**
```
? Set up and deploy "~/ai-plc-virtual-coach"? › No
? Link to existing project? › No
? What's your project's name? › ai-plc-virtual-coach
? In which directory is your code located? › ./
? Want to override the settings? › No
```

#### Step 4: Initial Deployment

```bash
# Deploy to preview environment
vercel
```

Wait for deployment to complete. Note the preview URL (e.g., `https://ai-plc-virtual-coach-abc123.vercel.app`)

- [ ] Visit the preview URL
- [ ] Confirm app loads successfully

#### Step 5: Set Environment Variables in Vercel

Go to Vercel Dashboard:
1. Navigate to https://vercel.com/dashboard
2. Select project: `ai-plc-virtual-coach`
3. Go to **Settings** > **Environment Variables**

Add these variables:
- [ ] `OPENAI_API_KEY` (paste your OpenAI key)
- [ ] `PINECONE_API_KEY` (paste your Pinecone key)
- [ ] `PINECONE_INDEX_NAME` = `plc-coach-demo`
- [ ] `PINECONE_ENVIRONMENT` = `us-east-1`
- [ ] `SESSION_SECRET` (paste your generated secret)

For each variable:
- Set environment: **Production**, **Preview**, **Development** (check all)
- Click **Save**

#### Step 6: Redeploy with Environment Variables

```bash
# Deploy to production
vercel --prod
```

Note the production URL.

#### Checklist

- [ ] Vercel CLI installed
- [ ] Logged into Vercel
- [ ] Project linked to Vercel
- [ ] Preview deployment successful
- [ ] Environment variables added in dashboard
- [ ] Production deployment successful
- [ ] App accessible at production URL
- [ ] No build errors

---

### Task 1.9: Database Setup (Vercel Postgres)

**Priority:** Critical
**Time Estimate:** 30 minutes

#### Step 1: Create Postgres Database in Vercel

1. Go to Vercel Dashboard
2. Select project: `ai-plc-virtual-coach`
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose region closest to you (or `us-east-1`)
7. Database name: `plc-coach-db`
8. Click **Create**

Wait for database to provision (~1-2 minutes).

#### Step 2: Pull Database Environment Variables

Vercel automatically adds database env vars to your project. Pull them locally:

```bash
# Pull latest env vars from Vercel
vercel env pull .env.local
```

This will update `.env.local` with:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

#### Step 3: Verify Database Connection

```bash
# Test connection
node -e "const { sql } = require('@vercel/postgres'); sql\`SELECT NOW()\`.then(r => console.log('✅ Database connected:', r.rows[0]))"
```

Should output: `✅ Database connected: { now: 2025-11-11T... }`

#### Step 4: Create Database Schema

Create file: `scripts/init-db.sql`

```sql
-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    summary TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    rating VARCHAR(50) CHECK (rating IN ('helpful', 'not_helpful')),
    feedback_text TEXT,
    follow_up_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_active ON conversations(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_message_id ON feedback(message_id);
```

#### Step 5: Create Migration Script

Create file: `scripts/migrate-db.ts`

```typescript
import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'init-db.sql'),
      'utf-8'
    );

    await sql.query(schemaSQL);

    console.log('✅ Database migration successful!');
    console.log('✅ Tables created: conversations, messages, feedback');
    console.log('✅ Indexes created');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

#### Step 6: Run Migration

```bash
# Install tsx for TypeScript execution
npm install -D tsx

# Add migration script to package.json
npm pkg set scripts.db:migrate="tsx scripts/migrate-db.ts"

# Run migration
npm run db:migrate
```

Expected output:
```
🔄 Starting database migration...
✅ Database migration successful!
✅ Tables created: conversations, messages, feedback
✅ Indexes created
```

#### Step 7: Verify Tables Created

```bash
# List tables
node -e "const { sql } = require('@vercel/postgres'); sql\`SELECT tablename FROM pg_tables WHERE schemaname='public'\`.then(r => console.log('Tables:', r.rows))"
```

Should show: `conversations`, `messages`, `feedback`

#### Checklist

- [ ] Vercel Postgres database created
- [ ] Environment variables pulled locally
- [ ] Database connection verified
- [ ] Schema SQL file created (`scripts/init-db.sql`)
- [ ] Migration script created (`scripts/migrate-db.ts`)
- [ ] Migration executed successfully
- [ ] Tables created: `conversations`, `messages`, `feedback`
- [ ] Indexes created

---

### Task 1.10: Create Basic Type Definitions

**Priority:** High
**Time Estimate:** 20 minutes

Create file: `app/types/index.ts`

```typescript
// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  modelUsed?: string;
  tokensUsed?: number;
  responseTime?: number; // milliseconds
  retrievedChunks?: number;
}

// Citation types
export interface Citation {
  id: string;
  sourceDocument: string;
  author: string;
  chapterOrSection: string;
  pageNumber?: number;
  relevanceScore: number;
  excerpt?: string;
  url?: string;
}

// Conversation/Session types
export interface ConversationSession {
  id: string;
  userId: string;
  startedAt: Date;
  lastActiveAt: Date;
  summary: string | null;
  messages: Message[];
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  criticalQuestionsFocused: (1 | 2 | 3 | 4)[];
  topicsDiscussed: string[];
  documentsReferenced: string[];
}

// Feedback types
export interface ResponseFeedback {
  id: string;
  messageId: string;
  conversationId: string;
  rating: 'helpful' | 'not_helpful';
  feedbackText?: string;
  followUpAction?: string;
  timestamp: Date;
}

// RAG types
export interface ChunkMetadata {
  sourceDocument: string;
  author: string;
  documentType: 'book' | 'article' | 'guide' | 'case_study' | 'faq';
  publicationYear?: number;
  chunkId: string;
  section: string;
  pageNumber?: number;
  criticalQuestion?: 1 | 2 | 3 | 4;
  bigIdea?: 'learning' | 'collaboration' | 'results';
  topics: string[];
  tokenCount: number;
  createdAt: string;
}

export interface Chunk {
  content: string;
  metadata: ChunkMetadata;
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

export interface RetrievalResult {
  chunk: Chunk;
  score: number;
}

// API types
export interface ChatRequest {
  sessionId: string;
  message: string;
  metadata?: {
    timestamp: string;
    source: 'web' | 'mobile';
  };
}

export interface ChatResponse {
  messageId: string;
  role: 'assistant';
  content: string;
  citations: Citation[];
  metadata: MessageMetadata;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}
```

#### Verify Types

```bash
# Check for TypeScript errors
npx tsc --noEmit
```

Should show no errors.

#### Checklist

- [ ] `app/types/index.ts` created
- [ ] All types from PRD Section 4 defined
- [ ] Types match API specifications (PRD Section 6)
- [ ] No TypeScript errors
- [ ] Can import types: `import { Message } from '@/types'`

---

### Task 1.11: Phase 1 Testing & Verification

**Priority:** High
**Time Estimate:** 15 minutes

#### Create Basic Test

Create file: `__tests__/setup.test.ts`

```typescript
describe('Phase 1 Setup Verification', () => {
  test('Environment variables are loaded', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined();
    expect(process.env.PINECONE_API_KEY).toBeDefined();
    expect(process.env.POSTGRES_URL).toBeDefined();
  });

  test('Node version is correct', () => {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    expect(major).toBeGreaterThanOrEqual(18);
  });
});
```

#### Install Testing Dependencies

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @types/jest jest-environment-jsdom
```

#### Configure Jest

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
```

#### Add Test Script

```bash
npm pkg set scripts.test="jest"
```

#### Run Tests

```bash
npm test
```

Should pass (or skip if not in proper test environment).

#### Final Manual Verification

- [ ] `npm run dev` starts without errors
- [ ] App loads at http://localhost:3000
- [ ] Vercel production URL works
- [ ] Database connection successful
- [ ] All environment variables present
- [ ] TypeScript compiles without errors
- [ ] Git repository pushed to GitHub

---

## ✅ Phase 1 Completion Checklist

Before moving to Phase 2, verify ALL of these:

### Application
- [ ] Next.js app runs locally (`npm run dev`)
- [ ] App deployed to Vercel
- [ ] Production URL accessible
- [ ] No console errors

### Dependencies
- [ ] All packages installed
- [ ] shadcn/ui configured
- [ ] Pinecone, OpenAI, LangChain installed
- [ ] No dependency conflicts

### Configuration
- [ ] Environment variables set locally and in Vercel
- [ ] Tailwind configured with Solution Tree colors
- [ ] TypeScript configured with strict mode
- [ ] Path aliases working (`@/` imports)

### Infrastructure
- [ ] Database created and migrated
- [ ] Tables created: conversations, messages, feedback
- [ ] Database connection verified
- [ ] Indexes created

### Development Setup
- [ ] GitHub repository created and pushed
- [ ] `.gitignore` properly configured
- [ ] Type definitions created
- [ ] Project structure matches PRD

---

## 📦 Deliverables

At the end of this phase, you should have:

1. **Working Next.js Application** - Runs locally and on Vercel
2. **Configured Database** - Postgres with schema migrated
3. **Type Definitions** - Complete TypeScript types
4. **GitHub Repository** - Code versioned and pushed
5. **Environment Variables** - Configured locally and in Vercel
6. **Deployment Pipeline** - Vercel connected to GitHub

---

## ⏭️ Next Steps

Once Phase 1 is complete, proceed to:
→ [Phase_2_Knowledge_Base.md](Phase_2_Knowledge_Base.md)

---

## 🆘 Troubleshooting

**Problem:** Vercel deployment fails
- **Solution:** Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Try deploying again: `vercel --prod`

**Problem:** Database migration fails
- **Solution:** Check `.env.local` has `POSTGRES_URL`
- Verify database was created in Vercel dashboard
- Try pulling env vars again: `vercel env pull .env.local`

**Problem:** TypeScript errors
- **Solution:** Run `npm install` to ensure all types are installed
- Check `tsconfig.json` has correct settings
- Restart VS Code: `Cmd+Shift+P` > "Reload Window"

**Problem:** Tailwind colors not working
- **Solution:** Restart dev server: Stop with `Ctrl+C`, then `npm run dev`
- Check `tailwind.config.ts` syntax (no trailing commas in last items)
- Clear Next.js cache: `rm -rf .next && npm run dev`

---

**Phase 1 Status:** 🔴 Not Started

Update status when complete: 🟢 Complete
Completion Date: _______
