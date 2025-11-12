/**
 * Session Detail API Endpoint
 *
 * GET /api/sessions/[id]
 * Returns a specific session with all its messages.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversationManager } from '@/app/lib/conversation/manager';
import type { SessionDetailsResponse, ErrorResponse } from '@/types';

/**
 * GET /api/sessions/[id]
 *
 * Get a specific session with all messages.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get session and messages
    const conversationManager = new ConversationManager();
    const { conversation } = await conversationManager.getContext(id);
    const messages = await conversationManager.getAllMessages(id);

    if (!conversation) {
      return NextResponse.json(
        {
          error: 'SESSION_NOT_FOUND',
          message: 'Session not found',
          timestamp: new Date().toISOString(),
        } as ErrorResponse,
        { status: 404 }
      );
    }

    const response: SessionDetailsResponse = {
      session: conversation,
      messages: messages,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Session Detail API] Error:', error);

    if (error.message.includes('Conversation not found')) {
      return NextResponse.json(
        {
          error: 'SESSION_NOT_FOUND',
          message: 'Session not found',
          timestamp: new Date().toISOString(),
        } as ErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch session',
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions/[id]
 *
 * Delete a session and all its messages.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { sql } = await import('@vercel/postgres');

    // Messages will cascade delete due to FK constraint
    await sql`
      DELETE FROM conversations
      WHERE id = ${id}
    `;

    console.log('[Session Detail API] Deleted session:', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Session Detail API] Error deleting session:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete session',
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
