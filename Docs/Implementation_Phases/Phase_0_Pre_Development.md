# Phase 0: Pre-Development Setup & Planning

**Duration:** 1-2 days
**Status:** 🔴 Not Started

---

## 📋 Overview

This phase ensures all prerequisites are in place before writing any code. Think of it as setting up your workspace before starting a project.

**Why This Phase Matters:**
- Prevents mid-project interruptions due to missing accounts or tools
- Ensures you have budget for API costs
- Validates your development environment works correctly
- Creates a foundation for smooth development

---

## 🎯 Objectives

By the end of this phase, you will have:
- ✅ All necessary accounts created and verified
- ✅ Development environment ready and tested
- ✅ API keys secured and documented
- ✅ Project planning and risk assessment complete

---

## 📝 Tasks

### Task 0.1: Account Setup & API Keys

**Priority:** Critical
**Time Estimate:** 1 hour

#### ✅ Vercel Account (Already have ✓)

- [ ] Verify account access at https://vercel.com/dashboard
- [ ] Check project limits on current plan
- [ ] Note: Free tier allows unlimited projects

#### ✅ OpenAI Account (Already have ✓)

- [ ] Verify API key is active at https://platform.openai.com/api-keys
- [ ] Check billing/credits available
- [ ] **Estimated cost for development:** $50-100
  - Embeddings: ~$2.50 for 2,500 chunks
  - GPT-4o API calls: ~$30-50 for testing
  - Buffer: $20 for iteration
- [ ] Set up usage alerts (recommended: $75 threshold)
  - Go to Settings > Usage Limits
  - Set hard limit: $100
  - Email notification: $75

#### 🔴 Pinecone Account (Need to create)

- [ ] Sign up at https://www.pinecone.io/
- [ ] Choose **FREE tier (Serverless)**
  - 100K vectors free
  - 3072 dimensions supported
  - Sufficient for demo
- [ ] Create API key
  - Go to API Keys section
  - Click "Create API Key"
  - Copy and save securely
- [ ] Note the environment/region (recommend: **us-east-1**)

#### ✅ GitHub Account (Assumed you have)

- [ ] Create new repository: `ai-plc-virtual-coach`
- [ ] Set to **private** initially
- [ ] Do NOT initialize with README (we'll create our own)
- [ ] Copy repository URL for later

---

### Task 0.2: Secure Storage of API Keys

**Priority:** Critical
**Time Estimate:** 15 minutes

**Create a secure document to store all API keys:**

Option 1: Use a password manager (Recommended)
- [ ] 1Password, LastPass, or Bitwarden
- [ ] Create entry: "AI PLC Coach - API Keys"
- [ ] Store all keys with labels

Option 2: Create encrypted .env.template file
- [ ] Create file: `.env.local.template`
- [ ] Add all keys with placeholders
- [ ] Store actual keys in secure location
- [ ] **NEVER commit actual keys to git**

**Keys to store:**
```bash
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=plc-coach-demo
PINECONE_ENVIRONMENT=us-east-1
GITHUB_REPO_URL=https://github.com/YOUR_USERNAME/ai-plc-virtual-coach.git
SESSION_SECRET=(will generate later)
```

---

### Task 0.3: Development Environment Verification

**Priority:** Critical
**Time Estimate:** 30 minutes

#### Node.js & npm

- [ ] Check Node.js version: `node --version`
  - **Required:** v18.17+ or v20+
  - If outdated, download from https://nodejs.org/
  - Recommend: Install Node 20 LTS

- [ ] Check npm version: `npm --version`
  - **Required:** v9+
  - Should come with Node.js

- [ ] Test npm installation:
  ```bash
  npm --version
  npx --version
  ```

#### Code Editor

- [ ] VS Code installed (or preferred editor)
- [ ] Install recommended VS Code extensions:
  - [ ] **ESLint** - Code linting
  - [ ] **Prettier** - Code formatting
  - [ ] **Tailwind CSS IntelliSense** - Tailwind autocomplete
  - [ ] **TypeScript + JavaScript** - TypeScript support
  - [ ] **GitHub Copilot** (optional but helpful)

To install extensions:
1. Open VS Code
2. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
3. Search for extension name
4. Click Install

#### Git Configuration

- [ ] Verify Git installed: `git --version`
  - **Required:** v2.0+
  - If not installed, download from https://git-scm.com/

- [ ] Configure Git (if not already done):
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```

- [ ] Verify configuration:
  ```bash
  git config --list
  ```

- [ ] Set up GitHub authentication:
  - Option A: SSH Key (Recommended)
    - [ ] Generate SSH key: `ssh-keygen -t ed25519 -C "your@email.com"`
    - [ ] Add to GitHub: Settings > SSH and GPG keys > New SSH key
    - [ ] Test: `ssh -T git@github.com`

  - Option B: HTTPS with Personal Access Token
    - [ ] Create token: GitHub > Settings > Developer settings > Personal access tokens
    - [ ] Select scopes: `repo`, `workflow`
    - [ ] Save token securely

#### Docker (Optional - for local database)

- [ ] Check if Docker Desktop is installed: `docker --version`
- [ ] If not installed: Download from https://www.docker.com/products/docker-desktop
- [ ] Start Docker Desktop
- [ ] Verify: `docker ps` (should show empty list, not an error)

**Note:** You can skip Docker and use Vercel Postgres directly if preferred.

---

### Task 0.4: Project Planning & Risk Assessment

**Priority:** High
**Time Estimate:** 1 hour

#### Review Core Documents

- [ ] Read [PRD.md](../PRD.md) in full (if not already done)
- [ ] Read [KnowledgeBase.md](../KnowledgeBase.md) research
- [ ] Read this Implementation Phases [README.md](README.md)

#### Define Success Metrics

Copy these metrics and track throughout project:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Response Accuracy** | 85%+ relevance to PLC framework | Expert evaluation of 20 test scenarios |
| **Citation Accuracy** | 100% valid sources | Automated testing |
| **Response Time (p95)** | <3 seconds | Performance monitoring |
| **User Satisfaction** | 4.5/5.0 average | Post-demo survey |
| **Framework Coverage** | All 4 Critical Questions | Test scenario matrix |

#### Identify Top 5 Risks

From PRD Section 11, these are the highest priority risks:

1. **OpenAI API downtime**
   - Probability: Medium | Impact: High
   - Mitigation: Implement retry logic, cache common responses

2. **Poor RAG retrieval quality**
   - Probability: Medium | Impact: High
   - Mitigation: Test extensively, refine chunking strategy

3. **Coaching tone misalignment**
   - Probability: Medium | Impact: High
   - Mitigation: Extensive prompt engineering, expert review

4. **Phase overruns**
   - Probability: High | Impact: Medium
   - Mitigation: Ruthlessly prioritize MVP, timebox phases

5. **Knowledge base prep delays**
   - Probability: Medium | Impact: Medium
   - Mitigation: Start early, use Claude for content generation

#### Create Timeline

Estimate your available time per day and calculate realistic timeline:

**Example:**
- Available hours per day: 4 hours
- Total estimated hours: 120-160 hours
- Calendar days needed: 30-40 days (at 4 hrs/day)

**Your Timeline:**
- Available hours per day: _____ hours
- Target completion date: _____
- Phase 0 complete by: _____
- Phase 1 complete by: _____
- (Continue for all phases)

---

## ✅ Phase 0 Completion Checklist

Before moving to Phase 1, verify:

- [ ] All accounts created and accessible
  - [ ] Vercel
  - [ ] OpenAI
  - [ ] Pinecone
  - [ ] GitHub

- [ ] All API keys obtained and stored securely
  - [ ] OpenAI API key
  - [ ] Pinecone API key
  - [ ] GitHub access configured

- [ ] Development environment verified
  - [ ] Node.js 18+ installed
  - [ ] npm working
  - [ ] Git configured
  - [ ] VS Code with extensions

- [ ] Documentation reviewed
  - [ ] PRD read and understood
  - [ ] Knowledge Base research reviewed
  - [ ] Success metrics defined
  - [ ] Timeline estimated

- [ ] Risk assessment complete
  - [ ] Top 5 risks identified
  - [ ] Mitigation strategies noted

---

## 📦 Deliverables

At the end of this phase, you should have:

1. **API Keys Document** - Securely stored credentials
2. **Environment Verification** - Confirmed working dev environment
3. **Timeline Document** - Realistic schedule with milestones
4. **Risk Register** - Top risks and mitigation plans

---

## ⏭️ Next Steps

Once Phase 0 is complete, proceed to:
→ [Phase_1_Foundation_Setup.md](Phase_1_Foundation_Setup.md)

---

## 🆘 Troubleshooting

**Problem:** Can't create Pinecone account
- **Solution:** Use alternative email, or contact Pinecone support

**Problem:** Node.js version too old
- **Solution:** Use nvm (Node Version Manager) to install latest
  ```bash
  # Install nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  # Install Node 20
  nvm install 20
  nvm use 20
  ```

**Problem:** Git authentication failing
- **Solution:** Use Personal Access Token instead of SSH
- Go to GitHub > Settings > Developer settings > Personal access tokens
- Generate new token with `repo` scope
- Use token as password when pushing

---

**Phase 0 Status:** 🔴 Not Started

Update status when complete: 🟢 Complete
