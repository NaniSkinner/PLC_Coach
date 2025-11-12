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

    console.log('[Chat API] Request:', {
      sessionId,
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    });

    // 2. Get conversation context
    const conversationManager = new ConversationManager();
    const { recentMessages } = await conversationManager.getContext(sessionId);

    // 3. Save user message
    await conversationManager.addMessage(sessionId, {
      role: 'user',
      content: message,
    });

    // 4. Run RAG pipeline
    const { retrievedChunks } = await ragPipeline(message, recentMessages, {
      topK: 5,
    });

    console.log('[Chat API] Retrieved chunks:', retrievedChunks.length);

    // 5. Generate response with GPT-4o
    const responseText = await generateResponse({
      userQuery: message,
      retrievedChunks,
      conversationHistory: recentMessages,
    });

    // 6. Extract citations
    const { content, citations } = extractCitations(responseText, retrievedChunks);

    const responseTime = Date.now() - startTime;

    console.log('[Chat API] Response generated:', {
      sessionId,
      responseTime,
      citationsCount: citations.length,
      chunksRetrieved: retrievedChunks.length,
    });

    // 7. Save assistant message
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

    // 8. Return response
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
