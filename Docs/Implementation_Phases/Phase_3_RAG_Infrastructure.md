# Phase 3: RAG Infrastructure & Indexing

**Duration:** 2-3 days
**Status:** 🔴 Not Started
**Prerequisites:** Phase 1 and 2 complete

---

## 📋 Overview

Process the knowledge base documents, generate embeddings, and upload to Pinecone. This phase creates the core RAG (Retrieval-Augmented Generation) infrastructure that powers the AI coach.

---

## 🎯 Objectives

By the end of this phase, you will have:
- ✅ Documents chunked into 400-550 pieces
- ✅ Embeddings generated for all chunks
- ✅ Pinecone index created and populated
- ✅ Retrieval system tested and validated
- ✅ Query processing pipeline working

---

## 📝 Tasks Summary

### Task 3.1: Create Pinecone Index (15 min)

**Script:** `scripts/create-pinecone-index.ts`

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

await pinecone.createIndex({
  name: 'plc-coach-demo',
  dimension: 3072, // text-embedding-3-large
  metric: 'cosine',
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1',
    },
  },
});
```

**Checklist:**
- [ ] Index created in Pinecone dashboard
- [ ] Dimension: 3072
- [ ] Metric: cosine
- [ ] Region: us-east-1

---

### Task 3.2: Document Chunking Strategy (4-6 hours)

**Script:** `scripts/chunk-documents.ts`

**Chunking Parameters:**
- Chunk size: 500 tokens (~2000 characters)
- Overlap: 50 tokens (for context continuity)
- Respect semantic boundaries (paragraphs > sentences)

**Key Features:**
- Preserve metadata at chunk level
- Never split mid-sentence
- Include source document reference
- Add chunk ID for tracking

**Example Chunk Metadata:**
```typescript
{
  chunkId: "lbd-ch5-001",
  sourceDocument: "Learning by Doing",
  author: "DuFour et al.",
  section: "Chapter 5: Critical Question 3",
  pageNumber: 142,
  criticalQuestion: 3,
  topics: ["intervention", "systematic response"],
  tokenCount: 487
}
```

**Checklist:**
- [ ] Chunking script created
- [ ] Respects paragraph boundaries
- [ ] 50-token overlap implemented
- [ ] Metadata preserved per chunk
- [ ] Test with 5 documents first
- [ ] Validate chunk quality manually

---

### Task 3.3: Embedding Generation (2-3 hours)

**Script:** `scripts/generate-embeddings.ts`

**OpenAI Configuration:**
- Model: `text-embedding-3-large`
- Dimensions: 3072
- Batch size: 100 (OpenAI supports up to 2048)

**Cost Estimate:**
- ~2,500 chunks × $0.13 per 1M tokens = ~$2.50

**Implementation:**
```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function generateEmbeddings(chunks: Chunk[]) {
  const batchSize = 100;
  const results = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: batch.map(c => c.content),
      dimensions: 3072,
    });

    // Add embeddings to chunks
    batch.forEach((chunk, idx) => {
      results.push({
        ...chunk,
        embedding: response.data[idx].embedding,
      });
    });

    console.log(`Processed ${i + batch.length} / ${chunks.length}`);

    // Rate limiting: 1 second between batches
    await sleep(1000);
  }

  return results;
}
```

**Checklist:**
- [ ] OpenAI SDK configured
- [ ] Batch processing implemented
- [ ] Rate limiting added (1s between batches)
- [ ] Progress logging
- [ ] Error handling for API failures
- [ ] Retry logic for transient errors

---

### Task 3.4: Upload to Pinecone (1-2 hours)

**Script:** `scripts/upload-to-pinecone.ts`

**Upsert Configuration:**
- Batch size: 100 vectors per upsert
- Include metadata with each vector
- Progress tracking

**Implementation:**
```typescript
const index = pinecone.index('plc-coach-demo');

async function uploadVectors(embeddedChunks: EmbeddedChunk[]) {
  const batchSize = 100;

  for (let i = 0; i < embeddedChunks.length; i += batchSize) {
    const batch = embeddedChunks.slice(i, i + batchSize);

    const vectors = batch.map(chunk => ({
      id: chunk.metadata.chunkId,
      values: chunk.embedding,
      metadata: {
        content: chunk.content,
        sourceDocument: chunk.metadata.sourceDocument,
        author: chunk.metadata.author,
        section: chunk.metadata.section,
        criticalQuestion: chunk.metadata.criticalQuestion,
        topics: chunk.metadata.topics.join(', '),
      },
    }));

    await index.upsert(vectors);
    console.log(`Uploaded ${i + batch.length} / ${embeddedChunks.length}`);
  }
}
```

**Checklist:**
- [ ] Pinecone index connected
- [ ] Batch upload working
- [ ] Metadata included with vectors
- [ ] Progress tracking
- [ ] All chunks uploaded successfully
- [ ] Verify count in Pinecone dashboard

---

### Task 3.5: Retrieval System Implementation (4-6 hours)

**File:** `app/lib/rag/retrieval.ts`

**Core Functions:**
1. `queryPinecone()` - Vector search
2. `rerankResults()` - Rerank by relevance + metadata
3. `retrieveContext()` - Main retrieval pipeline

**Implementation:**
```typescript
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

export async function retrieveContext(
  query: string,
  options: {
    topK?: number;
    criticalQuestion?: 1 | 2 | 3 | 4;
  } = {}
) {
  const { topK = 5, criticalQuestion } = options;

  // 1. Generate query embedding
  const openai = new OpenAI();
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: query,
  });

  // 2. Query Pinecone
  const pinecone = new Pinecone();
  const index = pinecone.index('plc-coach-demo');

  const queryResponse = await index.query({
    vector: embedding.data[0].embedding,
    topK: topK * 2, // Get more for reranking
    includeMetadata: true,
  });

  // 3. Rerank results
  const reranked = rerankResults(queryResponse.matches, {
    criticalQuestion,
  });

  // 4. Return top-k after reranking
  return reranked.slice(0, topK);
}

function rerankResults(results: any[], options: any) {
  return results
    .map(result => {
      let score = result.score;

      // Boost if CQ matches
      if (options.criticalQuestion &&
          result.metadata.criticalQuestion === options.criticalQuestion) {
        score *= 1.5;
      }

      // Boost core framework docs
      if (result.metadata.sourceDocument.includes('Core Framework')) {
        score *= 1.2;
      }

      return { ...result, adjustedScore: score };
    })
    .sort((a, b) => b.adjustedScore - a.adjustedScore);
}
```

**Checklist:**
- [ ] Retrieval module created
- [ ] Query embedding generation working
- [ ] Pinecone query working
- [ ] Reranking logic implemented
- [ ] Returns chunks with metadata
- [ ] Error handling added

---

### Task 3.6: Testing Retrieval Quality (2-3 hours)

**Script:** `scripts/test-retrieval.ts`

**Test Queries:**
```typescript
const testQueries = [
  {
    query: "How do we analyze CFA data?",
    expectedCQ: 2,
    expectedTopics: ["data analysis", "common formative assessment"],
  },
  {
    query: "What interventions work for struggling students?",
    expectedCQ: 3,
    expectedTopics: ["intervention", "systematic response"],
  },
  {
    query: "How to identify essential standards?",
    expectedCQ: 1,
    expectedTopics: ["essential standards", "curriculum"],
  },
  // Add 17 more test queries
];
```

**Test Each Query:**
```typescript
for (const test of testQueries) {
  const results = await retrieveContext(test.query, {
    topK: 5,
  });

  console.log(`\nQuery: ${test.query}`);
  console.log(`Expected CQ: ${test.expectedCQ}`);
  console.log(`Results:`);

  results.forEach((r, i) => {
    console.log(`  ${i+1}. ${r.metadata.sourceDocument} (CQ ${r.metadata.criticalQuestion}) - Score: ${r.score.toFixed(3)}`);
  });

  // Validate
  const hasExpectedCQ = results.some(r => r.metadata.criticalQuestion === test.expectedCQ);
  const hasExpectedTopics = results.some(r =>
    test.expectedTopics.some(topic => r.metadata.topics.includes(topic))
  );

  console.log(`  ✅ CQ Match: ${hasExpectedCQ}`);
  console.log(`  ✅ Topic Match: ${hasExpectedTopics}`);
}
```

**Success Criteria:**
- [ ] 85%+ of test queries return relevant results
- [ ] Top-3 results include expected Critical Question
- [ ] Average retrieval time < 200ms
- [ ] No retrieval errors

---

### Task 3.7: Create RAG Pipeline Orchestrator (2-3 hours)

**File:** `app/lib/rag/orchestrator.ts`

This brings it all together:

```typescript
export async function ragPipeline(
  userQuery: string,
  conversationHistory: Message[]
) {
  // 1. Preprocess query (enhance with history)
  const enhancedQuery = enhanceQueryWithHistory(userQuery, conversationHistory);

  // 2. Retrieve relevant chunks
  const chunks = await retrieveContext(enhancedQuery, {
    topK: 5,
  });

  // 3. Assemble context
  const context = assembleContext({
    systemPrompt: getSystemPrompt(),
    conversationHistory,
    retrievedChunks: chunks,
    userQuery,
  });

  // 4. Generate response (this will be in Phase 4)
  // const response = await generateResponse(context);

  return {
    retrievedChunks: chunks,
    context,
  };
}
```

**Checklist:**
- [ ] Orchestrator module created
- [ ] Query enhancement working
- [ ] Context assembly working
- [ ] Ready for LLM generation (Phase 4)

---

## ✅ Phase 3 Completion Checklist

- [ ] Pinecone index created and accessible
- [ ] All documents chunked (400-550 chunks)
- [ ] All chunks embedded (3072-dim vectors)
- [ ] All vectors uploaded to Pinecone
- [ ] Retrieval system implemented
- [ ] Test queries validated (85%+ accuracy)
- [ ] RAG orchestrator created
- [ ] Average retrieval time < 200ms
- [ ] No errors in retrieval pipeline

---

## 📦 Deliverables

1. **Pinecone Index** - Populated with vectors
2. **Chunking Script** - Processes documents
3. **Embedding Script** - Generates vectors
4. **Upload Script** - Populates Pinecone
5. **Retrieval Module** - `app/lib/rag/retrieval.ts`
6. **RAG Orchestrator** - `app/lib/rag/orchestrator.ts`
7. **Test Results** - Validation of retrieval quality

---

## ⏭️ Next Steps

Once Phase 3 is complete, proceed to:
→ [Phase_4_Backend_API.md](Phase_4_Backend_API.md)

---

## 🆘 Troubleshooting

**Problem:** Pinecone index creation fails
- Check API key is correct
- Verify free tier hasn't reached limits
- Try different region

**Problem:** Embedding generation is slow
- Increase batch size (up to 2048)
- Reduce sleep time between batches (but watch rate limits)
- Run in background overnight

**Problem:** Retrieval returns irrelevant results
- Refine chunking strategy (smaller chunks?)
- Adjust reranking boost factors
- Add more metadata filters
- Check query preprocessing

---

**Phase 3 Status:** 🔴 Not Started

Update status when complete: 🟢 Complete
Completion Date: _______
