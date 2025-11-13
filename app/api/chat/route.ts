/**
 * Chat API Endpoint
 *
 * This is the main API endpoint for the AI PLC Coach chat interface.
 *
 * Flow:
 * 1. Validate request (sessionId, message)
 * 2. Get conversation context from database
 * 3. Save user message
 * 4. Run RAG pipeline (retrieve relevant context)
 * 5. Generate response with GPT-4o
 * 6. Extract citations
 * 7. Save assistant message
 * 8. Return response to client
 */

import { NextRequest, NextResponse } from 'next/server';
import { ragPipeline } from '@/app/lib/rag/orchestrator';
import { generateResponse } from '@/app/lib/rag/generation';
import { extractCitations } from '@/app/lib/rag/citations';
import { ConversationManager } from '@/app/lib/conversation/manager';
import type { ChatRequest, ChatResponse, ErrorResponse } from '@/types';

// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();

/**
 * Check rate limit for a session
 * @param sessionId - The session identifier
 * @param limit - Maximum requests allowed (default: 10)
 * @param window - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns true if within limits, false if exceeded
 */
function checkRateLimit(
  sessionId: string,
  limit: number = 10,
  window: number = 60000
): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(sessionId) || [];

  // Filter requests within time window
  const recentRequests = requests.filter(time => now - time < window);

  if (recentRequests.length >= limit) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);
  rateLimiter.set(sessionId, recentRequests);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, times] of rateLimiter.entries()) {
      const validTimes = times.filter(t => now - t < window);
      if (validTimes.length === 0) {
        rateLimiter.delete(key);
      } else {
        rateLimiter.set(key, validTimes);
      }
    }
  }

  return true;
}

/**
 * Validate chat request
 */
function validateChatRequest(body: any): body is ChatRequest {
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    return false;
  }
  if (!body.message || typeof body.message !== 'string') {
    return false;
  }
  if (body.message.length > 2000) {
    return false;
  }
  return true;
}

/**
 * POST /api/chat
 *
 * Send a message and get a response from the AI PLC Coach.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parse and validate request
    const body = await req.json();

    if (!validateChatRequest(body)) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: 'Missing or invalid sessionId or message (max 2000 characters)',
          timestamp: new Date().toISOString(),
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const { sessionId, message } = body;

    // 2. Check rate limit (10 requests per minute per session)
    if (!checkRateLimit(sessionId, 10, 60000)) {
      console.warn('[Chat API] Rate limit exceeded:', { sessionId });
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait a moment and try again.',
          timestamp: new Date().toISOString(),
        } as ErrorResponse,
        { status: 429 }
      );
    }

    console.log('[Chat API] Request:', {
      sessionId,
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    });

    // 3. Get conversation context
    const conversationManager = new ConversationManager();
    const { recentMessages } = await conversationManager.getContext(sessionId);

    // 4. Save user message
    await conversationManager.addMessage(sessionId, {
      role: 'user',
      content: message,
    });

    // 5. Run RAG pipeline
    const { retrievedChunks } = await ragPipeline(message, recentMessages, {
      topK: 5,
    });

    console.log('[Chat API] Retrieved chunks:', retrievedChunks.length);

    // 6. Generate response with GPT-4o
    const responseText = await generateResponse({
      userQuery: message,
      retrievedChunks,
      conversationHistory: recentMessages,
    });

    // 7. Extract citations
    const { content, citations } = extractCitations(responseText, retrievedChunks);

    const responseTime = Date.now() - startTime;

    console.log('[Chat API] Response generated:', {
      sessionId,
      responseTime,
      citationsCount: citations.length,
      chunksRetrieved: retrievedChunks.length,
    });

    // 8. Save assistant message
    const messageId = await conversationManager.addMessage(sessionId, {
      role: 'assistant',
      content,
      citations,
      metadata: {
        modelUsed: 'gpt-4o',
        responseTime,
        retrievedChunks: retrievedChunks.length,
        tokensUsed: 0, // TODO: Add token counting from OpenAI response
      },
    });

    // 9. Return response
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
  } catch (error: any) {
    console.error('[Chat API] Error:', error);

    const responseTime = Date.now() - startTime;

    // Handle specific error types
    if (error.message.includes('Conversation not found')) {
      return NextResponse.json(
        {
          error: 'SESSION_NOT_FOUND',
          message: 'Session not found. Please create a new session.',
          timestamp: new Date().toISOString(),
        } as ErrorResponse,
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to generate response',
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
