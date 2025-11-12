/**
 * RAG (Retrieval-Augmented Generation) System
 *
 * This is the main entry point for the RAG system.
 * Export all key functions and types from the RAG modules.
 */

// Retrieval exports
export {
  retrieveContext,
  retrieveForCriticalQuestion,
  retrieveForCategory,
  generateQueryEmbedding,
  queryPinecone,
  rerankResults,
  formatContextForLLM,
  getRetrievalStats,
  type RetrievalOptions,
  type RetrievedChunk,
} from './retrieval';

// Orchestrator exports
export {
  ragPipeline,
  ragPipelineForCriticalQuestion,
  ragPipelineForCategory,
  getSystemPrompt,
  enhanceQueryWithHistory,
  assembleContext,
  type Message,
  type RAGPipelineOptions,
  type RAGPipelineResult,
} from './orchestrator';
