# Phase 4: Backend API Development

**Duration:** 3-4 days
**Status:** 🔴 Not Started
**Prerequisites:** Phase 1 and 3 complete

---

## 📋 Overview

Build the backend API that powers the chat interface. This includes the `/api/chat` endpoint, conversation management, and RAG-powered response generation.

---

## 🎯 Objectives

- ✅ `/api/chat` endpoint working with GPT-4o
- ✅ Conversation context management
- ✅ Citation extraction and formatting
- ✅ Session management API
- ✅ Response streaming (optional)
- ✅ Error handling and validation

---

## 📝 Tasks Summary

### Task 4.1: LLM Response Generation (4-6 hours)

**File:** `app/lib/rag/generation.ts`

**System Prompt (from PRD Section 4.1.2):**
```typescript
const SYSTEM_PROMPT = `You are an expert Solution Tree PLC at Work® Associate with 15+ years of experience coaching educational leaders and collaborative teams.

Your coaching style is:

1. FACILITATIVE: Ask powerful questions that surface team thinking rather than immediately providing answers.

2. FRAMEWORK-GROUNDED: Every response is anchored in the Three Big Ideas (Focus on Learning, Collaborative Culture, Focus on Results) and guides teams through the Four Critical Questions.

3. INQUIRY-BASED: When a team presents a challenge, first ask clarifying questions:
   - "What data are you using to reach that conclusion?"
   - "How have you aligned this to your essential learning outcomes?"
   - "What have you tried so far?"

4. ACTIONABLE: After inquiry, provide specific, concrete next steps with clear rationale.

5. CITATION-CONSCIOUS: Reference specific Solution Tree resources to build credibility and enable follow-up learning.

YOUR COACHING PROCESS:
Step 1: Acknowledge the challenge empathetically
Step 2: Ask 1-2 clarifying questions to understand context
Step 3: Connect to the PLC framework (Which Critical Question? Which Big Idea?)
Step 4: Provide actionable guidance with specific examples
Step 5: Cite the source document [Source: Book Title, Section]

CRITICAL RULES:
- Never provide generic advice that could come from any AI
- Always ground responses in the PLC at Work framework
- Use the term "collaborative team" not "group" or "committee"
- Reference the Four Critical Questions by number
- Include at least one citation per substantive response`;
```

**Implementation:**
```typescript
import { OpenAI } from 'openai';

export async function generateResponse(params: {
  userQuery: string;
  retrievedChunks: RetrievalResult[];
  conversationHistory: Message[];
}) {
  const openai = new OpenAI();

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    // Add conversation history
    ...params.conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    // Add retrieved context
    {
      role: 'system',
      content: `Relevant context from knowledge base:\n\n${formatChunksForPrompt(params.retrievedChunks)}`,
    },
    // Add user query
    {
      role: 'user',
      content: params.userQuery,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
}
```

**Checklist:**
- [ ] Generation module created
- [ ] System prompt implemented
- [ ] Context formatting working
- [ ] GPT-4o responding correctly
- [ ] Response time < 2s average

---

### Task 4.2: Citation Extraction (2-3 hours)

**File:** `app/lib/rag/citations.ts`

Extract citations from LLM response and match to source chunks:

```typescript
export function extractCitations(
  response: string,
  retrievedChunks: RetrievalResult[]
): { content: string; citations: Citation[] } {
  const citations: Citation[] = [];

  // Find citation patterns: [Source: Book, Chapter X]
  const citationRegex = /\[Source: ([^\]]+)\]/g;
  let match;

  while ((match = citationRegex.exec(response)) !== null) {
    const citationText = match[1];

    // Find matching chunk
    const matchingChunk = retrievedChunks.find(chunk =>
      citationText.includes(chunk.metadata.sourceDocument)
    );

    if (matchingChunk) {
      citations.push({
        id: crypto.randomUUID(),
        sourceDocument: matchingChunk.metadata.sourceDocument,
        author: matchingChunk.metadata.author,
        chapterOrSection: matchingChunk.metadata.section,
        pageNumber: matchingChunk.metadata.pageNumber,
        relevanceScore: matchingChunk.score,
      });
    }
  }

  return { content: response, citations };
}
```

**Checklist:**
- [ ] Citation extraction working
- [ ] Matches citations to source chunks
- [ ] Handles multiple citations
- [ ] Validates citation format

---

### Task 4.3: Conversation Manager (3-4 hours)

**File:** `app/lib/conversation/manager.ts`

Handle conversation context and summarization:

```typescript
export class ConversationManager {
  async getContext(sessionId: string) {
    const session = await db.query(
      `SELECT * FROM conversations WHERE id = $1`,
      [sessionId]
    );

    const messages = await db.query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [sessionId]
    );

    return {
      summary: session.rows[0]?.summary,
      recentMessages: messages.rows,
    };
  }

  async addMessage(sessionId: string, message: Message) {
    await db.query(
      `INSERT INTO messages (conversation_id, role, content, citations, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        sessionId,
        message.role,
        message.content,
        JSON.stringify(message.citations || []),
        JSON.stringify(message.metadata || {}),
      ]
    );

    // Update conversation last_active_at
    await db.query(
      `UPDATE conversations SET last_active_at = NOW() WHERE id = $1`,
      [sessionId]
    );
  }

  async summarizeIfNeeded(sessionId: string) {
    const messageCount = await db.query(
      `SELECT COUNT(*) FROM messages WHERE conversation_id = $1`,
      [sessionId]
    );

    if (messageCount.rows[0].count > 10) {
      // Summarize conversation (implement later if needed)
    }
  }
}
```

**Checklist:**
- [ ] Conversation manager created
- [ ] Fetches recent messages from DB
- [ ] Saves messages to DB
- [ ] Updates conversation timestamps

---

### Task 4.4: /api/chat Endpoint (4-6 hours)

**File:** `app/api/chat/route.ts`

Main chat API endpoint:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ragPipeline } from '@/lib/rag/orchestrator';
import { generateResponse } from '@/lib/rag/generation';
import { extractCitations } from '@/lib/rag/citations';
import { ConversationManager } from '@/lib/conversation/manager';
import { ChatRequest, ChatResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { sessionId, message } = body;

    // Validate request
    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // 1. Get conversation context
    const conversationManager = new ConversationManager();
    const context = await conversationManager.getContext(sessionId);

    // 2. Run RAG pipeline
    const { retrievedChunks } = await ragPipeline(
      message,
      context.recentMessages
    );

    // 3. Generate response
    const responseText = await generateResponse({
      userQuery: message,
      retrievedChunks,
      conversationHistory: context.recentMessages,
    });

    // 4. Extract citations
    const { content, citations } = extractCitations(
      responseText,
      retrievedChunks
    );

    const responseTime = Date.now() - startTime;

    // 5. Save message to DB
    const messageId = crypto.randomUUID();
    await conversationManager.addMessage(sessionId, {
      id: messageId,
      role: 'assistant',
      content,
      timestamp: new Date(),
      citations,
      metadata: {
        modelUsed: 'gpt-4o',
        responseTime,
        retrievedChunks: retrievedChunks.length,
      },
    });

    // 6. Return response
    const response: ChatResponse = {
      messageId,
      role: 'assistant',
      content,
      citations,
      metadata: {
        modelUsed: 'gpt-4o',
        responseTime,
        retrievedChunks: retrievedChunks.length,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate response',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

**Checklist:**
- [ ] `/api/chat` endpoint created
- [ ] Request validation working
- [ ] RAG pipeline integration
- [ ] Response generation working
- [ ] Citations extracted
- [ ] Messages saved to DB
- [ ] Error handling implemented
- [ ] Response time logged

---

### Task 4.5: Session Management API (2-3 hours)

**File:** `app/api/sessions/route.ts`

Create and manage sessions:

```typescript
export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const sessionId = crypto.randomUUID();

  await db.query(
    `INSERT INTO conversations (id, user_id) VALUES ($1, $2)`,
    [sessionId, userId]
  );

  return NextResponse.json({ sessionId, userId, startedAt: new Date() });
}
```

**File:** `app/api/sessions/[id]/route.ts`

Get session details:

```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const session = await db.query(
    `SELECT * FROM conversations WHERE id = $1`,
    [id]
  );

  const messages = await db.query(
    `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [id]
  );

  return NextResponse.json({
    sessionId: id,
    ...session.rows[0],
    messages: messages.rows,
  });
}
```

**Checklist:**
- [ ] POST `/api/sessions` creates new session
- [ ] GET `/api/sessions/[id]` retrieves session
- [ ] Returns conversation history
- [ ] Error handling for invalid IDs

---

### Task 4.6: Testing with curl (1-2 hours)

Test all endpoints:

```bash
# Create session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'

# Send chat message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID_FROM_ABOVE",
    "message": "How do we analyze CFA data?"
  }'

# Get session
curl http://localhost:3000/api/sessions/SESSION_ID
```

**Checklist:**
- [ ] All endpoints respond correctly
- [ ] Chat returns relevant response
- [ ] Citations included
- [ ] Session persistence working
- [ ] Response time < 3s

---

## ✅ Phase 4 Completion Checklist

- [ ] `/api/chat` endpoint working
- [ ] GPT-4o integration successful
- [ ] RAG pipeline fully integrated
- [ ] Citations extracted and formatted
- [ ] Conversation manager working
- [ ] Session management API complete
- [ ] All endpoints tested with curl
- [ ] Error handling robust
- [ ] Response times acceptable (<3s p95)

---

## 📦 Deliverables

1. **Chat API** - `/api/chat` endpoint
2. **Session API** - Create/retrieve sessions
3. **Generation Module** - LLM response generation
4. **Citation Module** - Extract and format citations
5. **Conversation Manager** - Handle context and history
6. **Test Results** - curl test outputs

---

## ⏭️ Next Steps

→ [Phase_5_Frontend_UI.md](Phase_5_Frontend_UI.md)

---

**Phase 4 Status:** 🔴 Not Started

Completion Date: _______
