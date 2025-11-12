/**
 * RAG Retrieval System
 *
 * This module provides the core retrieval functionality for the AI PLC Coach.
 * It handles:
 * 1. Query embedding generation
 * 2. Vector search in Pinecone
 * 3. Result reranking based on metadata
 * 4. Context assembly for LLM
 */

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Types
export interface RetrievalOptions {
  topK?: number;
  criticalQuestion?: 1 | 2 | 3 | 4;
  category?: string;
  minScore?: number;
}

export interface RetrievedChunk {
  id: string;
  score: number;
  adjustedScore: number;
  content: string;
  metadata: {
    sourceDocument: string;
    sourceFile: string;
    category: string;
    title: string;
    author?: string;
    criticalQuestion: string;
    topics: string;
    documentType: string;
    chunkIndex: number;
    totalChunks: number;
    estimatedTokens: number;
  };
}

// Initialize clients (singleton pattern)
let openaiClient: OpenAI | null = null;
let pineconeClient: Pinecone | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openaiClient;
}

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

/**
 * Generate embedding for a query using OpenAI
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const openai = getOpenAIClient();

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: query,
    dimensions: 3072,
  });

  return response.data[0].embedding;
}

/**
 * Query Pinecone for similar vectors
 */
export async function queryPinecone(
  embedding: number[],
  topK: number = 10,
  filter?: Record<string, any>
): Promise<any[]> {
  const pinecone = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX_NAME || 'plc-coach-demo';
  const index = pinecone.index(indexName);

  const queryResponse = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter,
  });

  return queryResponse.matches || [];
}

/**
 * Rerank results based on metadata and relevance
 *
 * Boost factors:
 * - Critical Question match: 1.5x
 * - Core framework documents: 1.2x
 * - Coaching scenarios: 1.1x
 * - Category match: 1.3x
 */
export function rerankResults(
  results: any[],
  options: RetrievalOptions = {}
): RetrievedChunk[] {
  return results
    .map((result) => {
      let score = result.score || 0;
      let adjustedScore = score;

      // Boost if Critical Question matches
      if (options.criticalQuestion && result.metadata?.criticalQuestion) {
        const criticalQuestions = result.metadata.criticalQuestion.split(',').map(Number);
        if (criticalQuestions.includes(options.criticalQuestion)) {
          adjustedScore *= 1.5;
        }
      }

      // Boost core framework documents (more foundational)
      if (result.metadata?.category === '01_core_framework') {
        adjustedScore *= 1.2;
      }

      // Boost coaching scenarios (practical examples)
      if (result.metadata?.category === '03_coaching_scenarios') {
        adjustedScore *= 1.1;
      }

      // Boost if category matches
      if (options.category && result.metadata?.category === options.category) {
        adjustedScore *= 1.3;
      }

      return {
        id: result.id,
        score,
        adjustedScore,
        content: result.metadata?.content || '',
        metadata: {
          sourceDocument: result.metadata?.sourceDocument || '',
          sourceFile: result.metadata?.sourceFile || '',
          category: result.metadata?.category || '',
          title: result.metadata?.title || '',
          author: result.metadata?.author,
          criticalQuestion: result.metadata?.criticalQuestion || 'none',
          topics: result.metadata?.topics || '',
          documentType: result.metadata?.documentType || '',
          chunkIndex: result.metadata?.chunkIndex || 0,
          totalChunks: result.metadata?.totalChunks || 0,
          estimatedTokens: result.metadata?.estimatedTokens || 0,
        },
      } as RetrievedChunk;
    })
    .sort((a, b) => b.adjustedScore - a.adjustedScore);
}

/**
 * Main retrieval function: combines embedding generation, querying, and reranking
 */
export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedChunk[]> {
  const { topK = 5, minScore = 0.5 } = options;

  // Step 1: Generate query embedding
  const embedding = await generateQueryEmbedding(query);

  // Step 2: Query Pinecone (get more results for reranking)
  const results = await queryPinecone(embedding, topK * 2);

  // Step 3: Rerank results
  const reranked = rerankResults(results, options);

  // Step 4: Filter by minimum score and return top-k
  return reranked.filter((r) => r.score >= minScore).slice(0, topK);
}

/**
 * Retrieve context for a specific Critical Question
 */
export async function retrieveForCriticalQuestion(
  query: string,
  criticalQuestion: 1 | 2 | 3 | 4,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  return retrieveContext(query, {
    topK,
    criticalQuestion,
  });
}

/**
 * Retrieve context for a specific category
 */
export async function retrieveForCategory(
  query: string,
  category: string,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  return retrieveContext(query, {
    topK,
    category,
  });
}

/**
 * Format retrieved chunks into a context string for LLM
 */
export function formatContextForLLM(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return 'No relevant context found in the knowledge base.';
  }

  return chunks
    .map((chunk, index) => {
      return `
[Source ${index + 1}]
Document: ${chunk.metadata.title}
Category: ${chunk.metadata.category}
Critical Question(s): ${chunk.metadata.criticalQuestion}

${chunk.content}
`.trim();
    })
    .join('\n\n---\n\n');
}

/**
 * Get statistics about retrieved chunks
 */
export function getRetrievalStats(chunks: RetrievedChunk[]) {
  const categories = new Set(chunks.map((c) => c.metadata.category));
  const criticalQuestions = new Set(
    chunks.flatMap((c) => c.metadata.criticalQuestion.split(',').map(Number))
  );
  const avgScore = chunks.reduce((sum, c) => sum + c.score, 0) / chunks.length;

  return {
    totalChunks: chunks.length,
    categories: Array.from(categories),
    criticalQuestions: Array.from(criticalQuestions).sort(),
    avgScore: avgScore.toFixed(3),
    minScore: chunks.length > 0 ? Math.min(...chunks.map((c) => c.score)).toFixed(3) : '0',
    maxScore: chunks.length > 0 ? Math.max(...chunks.map((c) => c.score)).toFixed(3) : '0',
  };
}
