/**
 * Conversation Manager
 *
 * This module handles all database operations for conversations and messages.
 * It manages:
 * - Fetching conversation context
 * - Saving messages to database
 * - Updating conversation metadata
 * - Managing conversation history
 */

import { sql } from '@vercel/postgres';
import type { Message, Conversation, Citation } from '@/types';

/**
 * ConversationManager class
 *
 * Handles all conversation-related database operations.
 */
export class ConversationManager {
  /**
   * Get conversation context for LLM generation
   *
   * Returns:
   * - Conversation metadata (summary, etc.)
   * - Recent messages (last 10 for context)
   */
  async getContext(sessionId: string): Promise<{
    conversation: Conversation | null;
    recentMessages: Message[];
  }> {
    try {
      // Get conversation
      const conversationResult = await sql`
        SELECT * FROM conversations
        WHERE id = ${sessionId}
      `;

      if (conversationResult.rows.length === 0) {
        throw new Error(`Conversation not found: ${sessionId}`);
      }

      const conversation = conversationResult.rows[0] as any;

      // Get recent messages (last 10, ordered chronologically)
      const messagesResult = await sql`
        SELECT * FROM messages
        WHERE conversation_id = ${sessionId}
        ORDER BY created_at DESC
        LIMIT 10
      `;

      // Reverse to get chronological order (oldest to newest)
      const messages: Message[] = messagesResult.rows.reverse().map((row: any) => ({
        id: row.id,
        role: row.role as 'user' | 'assistant' | 'system',
        content: row.content,
        timestamp: new Date(row.created_at),
        citations: row.citations || [],
        metadata: row.metadata || {},
      }));

      return {
        conversation: {
          id: conversation.id,
          user_id: conversation.user_id,
          summary: conversation.summary,
          created_at: new Date(conversation.created_at),
          last_active_at: new Date(conversation.last_active_at),
          message_count: conversation.message_count,
        },
        recentMessages: messages,
      };
    } catch (error: any) {
      console.error('Error getting conversation context:', error);
      throw new Error(`Failed to get context: ${error.message}`);
    }
  }

  /**
   * Add a message to the conversation
   *
   * Saves the message and updates conversation metadata.
   * Returns the new message ID.
   */
  async addMessage(
    sessionId: string,
    message: Omit<Message, 'id' | 'timestamp'>
  ): Promise<string> {
    try {
      const messageId = crypto.randomUUID();

      // Insert message
      await sql`
        INSERT INTO messages (
          id,
          conversation_id,
          role,
          content,
          citations,
          metadata
        ) VALUES (
          ${messageId},
          ${sessionId},
          ${message.role},
          ${message.content},
          ${JSON.stringify(message.citations || [])},
          ${JSON.stringify(message.metadata || {})}
        )
      `;

      // Update conversation last_active_at and message_count
      await sql`
        UPDATE conversations
        SET
          last_active_at = NOW(),
          message_count = message_count + 1
        WHERE id = ${sessionId}
      `;

      return messageId;
    } catch (error: any) {
      console.error('Error adding message:', error);
      throw new Error(`Failed to add message: ${error.message}`);
    }
  }

  /**
   * Update conversation metadata
   *
   * Currently supports updating the summary field.
   * Can be extended for other metadata.
   */
  async updateConversation(
    sessionId: string,
    updates: { summary?: string }
  ): Promise<void> {
    try {
      if (updates.summary) {
        await sql`
          UPDATE conversations
          SET summary = ${updates.summary}
          WHERE id = ${sessionId}
        `;
      }
    } catch (error: any) {
      console.error('Error updating conversation:', error);
      throw new Error(`Failed to update conversation: ${error.message}`);
    }
  }

  /**
   * Summarize conversation if needed
   *
   * Checks if the conversation has grown long enough to warrant summarization.
   * This is a placeholder for future implementation.
   */
  async summarizeIfNeeded(sessionId: string): Promise<void> {
    try {
      const messageCountResult = await sql`
        SELECT COUNT(*) as count
        FROM messages
        WHERE conversation_id = ${sessionId}
      `;

      const count = parseInt(messageCountResult.rows[0].count);

      if (count > 20) {
        console.log(
          `Conversation ${sessionId} has ${count} messages - consider summarizing`
        );
        // TODO: Implement summarization using LLM
        // For now, just log
      }
    } catch (error: any) {
      console.error('Error checking for summarization:', error);
      // Don't throw - this is optional functionality
    }
  }

  /**
   * Get all messages for a conversation
   *
   * Returns all messages in chronological order.
   * Used for session retrieval API.
   */
  async getAllMessages(sessionId: string): Promise<Message[]> {
    try {
      const messagesResult = await sql`
        SELECT * FROM messages
        WHERE conversation_id = ${sessionId}
        ORDER BY created_at ASC
      `;

      return messagesResult.rows.map((row: any) => ({
        id: row.id,
        role: row.role as 'user' | 'assistant' | 'system',
        content: row.content,
        timestamp: new Date(row.created_at),
        citations: row.citations || [],
        metadata: row.metadata || {},
      }));
    } catch (error: any) {
      console.error('Error getting all messages:', error);
      throw new Error(`Failed to get messages: ${error.message}`);
    }
  }
}
