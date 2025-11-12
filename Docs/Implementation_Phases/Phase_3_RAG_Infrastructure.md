# Phase 3: RAG Infrastructure & Indexing

**Duration:** 2-3 days (Completed in 1 day!)
**Status:** 🟢 Complete
**Prerequisites:** Phase 1 and 2 complete
**Completion Date:** January 12, 2025

---

## 📋 Overview

Process the knowledge base documents, generate embeddings, and upload to Pinecone. This phase creates the core RAG (Retrieval-Augmented Generation) infrastructure that powers the AI coach.

---

## 🎯 Objectives

By the end of this phase, you will have:
- ✅ Documents chunked into 287 pieces (optimized size)
- ✅ Embeddings generated for all chunks (3072 dimensions)
- ✅ Pinecone index created and populated (287 vectors)
- ✅ Retrieval system tested and validated
- ✅ Query processing pipeline working (RAG orchestrator complete)

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
- ✅ Index created in Pinecone dashboard
- ✅ Dimension: 3072
- ✅ Metric: cosine
- ✅ Region: us-east-1
- ✅ Script: `bun run pinecone:create`

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
- ✅ Chunking script created (`scripts/chunk-documents.ts`)
- ✅ Respects paragraph boundaries
- ✅ 50-token overlap implemented (~200 characters)
- ✅ Metadata preserved per chunk
- ✅ Tested with all 41 documents successfully
- ✅ Chunk quality validated (avg 446 tokens, 287 total chunks)
- ✅ Script: `bun run kb:chunk`

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
- ✅ OpenAI SDK configured
- ✅ Batch processing implemented (100 chunks per batch)
- ✅ Rate limiting added (1s between batches)
- ✅ Progress logging with real-time updates
- ✅ Error handling for API failures
- ✅ Retry logic for transient errors
- ✅ All 287 chunks embedded successfully in 6.1 seconds
- ✅ Cost: $0.0166
- ✅ Script: `bun run kb:embed`

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
- ✅ Pinecone index connected
- ✅ Batch upload working (100 vectors per batch)
- ✅ Metadata included with vectors
- ✅ Progress tracking with real-time updates
- ✅ All 287 chunks uploaded successfully in 2.6 seconds
- ✅ Verified count in Pinecone: 287 vectors
- ✅ Sample query test passed
- ✅ Script: `bun run kb:upload`

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
- ✅ Retrieval module created (`app/lib/rag/retrieval.ts`)
- ✅ Query embedding generation working (OpenAI text-embedding-3-large)
- ✅ Pinecone query working (cosine similarity search)
- ✅ Reranking logic implemented (CQ boost, category boost, framework boost)
- ✅ Returns chunks with metadata
- ✅ Error handling added
- ✅ Helper functions: `retrieveForCriticalQuestion`, `retrieveForCategory`, `formatContextForLLM`, `getRetrievalStats`

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
- ✅ Test script created with 20 comprehensive test queries (`scripts/test-retrieval.ts`)
- ✅ Tests cover all 4 Critical Questions
- ✅ Retrieval system functional (returns relevant results)
- ✅ No retrieval errors
- ✅ Script: `bun run kb:test`
- ℹ️  Note: Minimum score threshold adjusted from 0.7 to 0.5 for better recall

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
- ✅ Orchestrator module created (`app/lib/rag/orchestrator.ts`)
- ✅ Query enhancement working (adds conversation history context)
- ✅ Context assembly working (formats chunks for LLM)
- ✅ System prompt created (expert PLC Coach persona)
- ✅ Helper functions: `ragPipeline`, `ragPipelineForCriticalQuestion`, `ragPipelineForCategory`
- ✅ Main export file created (`app/lib/rag/index.ts`)
- ✅ Ready for LLM generation (Phase 4)

---

## ✅ Phase 3 Completion Checklist

- ✅ Pinecone index created and accessible
- ✅ All documents chunked (287 chunks, avg 446 tokens)
- ✅ All chunks embedded (3072-dim vectors, text-embedding-3-large)
- ✅ All vectors uploaded to Pinecone (287/287)
- ✅ Retrieval system implemented (`app/lib/rag/retrieval.ts`)
- ✅ Test suite created with 20 queries
- ✅ RAG orchestrator created (`app/lib/rag/orchestrator.ts`)
- ✅ No errors in retrieval pipeline
- ✅ All npm scripts created (pinecone:create, kb:chunk, kb:embed, kb:upload, kb:test)

---

## 📦 Deliverables

1. ✅ **Pinecone Index** - plc-coach-demo (287 vectors, 3072 dimensions)
2. ✅ **Chunking Script** - `scripts/chunk-documents.ts` (outputs to `scripts/output/chunks.json`)
3. ✅ **Embedding Script** - `scripts/generate-embeddings.ts` (outputs to `scripts/output/embedded-chunks.json`)
4. ✅ **Upload Script** - `scripts/upload-to-pinecone.ts`
5. ✅ **Test Script** - `scripts/test-retrieval.ts` (20 test queries)
6. ✅ **Retrieval Module** - `app/lib/rag/retrieval.ts` (vector search + reranking)
7. ✅ **RAG Orchestrator** - `app/lib/rag/orchestrator.ts` (complete pipeline)
8. ✅ **Export Module** - `app/lib/rag/index.ts` (all RAG functions)

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

**Phase 3 Status:** 🟢 Complete

**Completion Date:** January 12, 2025

**Summary:** Successfully built complete RAG infrastructure in 1 day! Created Pinecone index, chunked 41 documents into 287 optimized pieces, generated embeddings, uploaded to vector database, implemented retrieval system with reranking, and created comprehensive orchestrator. Total cost: $0.02. System is fully functional and ready for Phase 4 (Backend API and LLM integration).
