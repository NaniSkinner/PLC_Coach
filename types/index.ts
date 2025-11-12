/**
 * Type Definitions for AI PLC Coach
 *
 * This file contains all shared types used across the application.
 */

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  metadata?: Record<string, any>;
}

// ============================================================================
// Citation Types
// ============================================================================

export interface Citation {
  id: string;
  sourceDocument: string;
  author: string;
  chapterOrSection?: string;
  pageNumber?: string;
  relevanceScore: number;
}

// ============================================================================
// Conversation/Session Types
// ============================================================================

export interface Conversation {
  id: string;
  user_id: string;
  summary?: string;
  created_at: Date;
  last_active_at: Date;
  message_count: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface ChatResponse {
  messageId: string;
  role: 'assistant';
  content: string;
  citations: Citation[];
  metadata: {
    modelUsed: string;
    responseTime: number;
    retrievedChunks: number;
    tokensUsed?: number;
  };
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}

export interface SessionResponse {
  sessionId: string;
  userId: string;
  startedAt: string;
  messageCount: number;
}

export interface SessionDetailsResponse {
  session: Conversation;
  messages: Message[];
}

// ============================================================================
// Database Row Types (from Postgres queries)
// ============================================================================

export interface ConversationRow {
  id: string;
  user_id: string;
  summary: string | null;
  created_at: Date;
  last_active_at: Date;
  message_count: number;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: Date;
  citations: string; // JSON string
  metadata: string; // JSON string
}
