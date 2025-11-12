/**
 * Sessions API Endpoint
 *
 * Handles session/conversation management:
 * - POST: Create new session
 * - GET: List user's sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import type { SessionResponse, ErrorResponse } from '@/types';

/**
 * POST /api/sessions
 *
 * Create a new conversation session.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'anonymous';

    const sessionId = crypto.randomUUID();

    // Create new conversation in database
    await sql`
      INSERT INTO conversations (id, user_id)
      VALUES (${sessionId}, ${userId})
    `;

    console.log('[Sessions API] Created session:', { sessionId, userId });

    const response: SessionResponse = {
      sessionId,
      userId,
      startedAt: new Date().toISOString(),
      messageCount: 0,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Sessions API] Error creating session:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create session',
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/sessions
 *
 * List all sessions for a user.
 * Query param: ?userId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'anonymous';

    // Get user's sessions (most recent first)
    const result = await sql`
      SELECT * FROM conversations
      WHERE user_id = ${userId}
      ORDER BY last_active_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      sessions: result.rows.map((row: any) => ({
        sessionId: row.id,
        userId: row.user_id,
        summary: row.summary,
        createdAt: row.created_at,
        lastActiveAt: row.last_active_at,
        messageCount: row.message_count,
      })),
    });
  } catch (error: any) {
    console.error('[Sessions API] Error fetching sessions:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch sessions',
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
