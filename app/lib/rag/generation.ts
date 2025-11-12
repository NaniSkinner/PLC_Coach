/**
 * LLM Response Generation Module
 *
 * This module handles generating responses using GPT-4o with the RAG pipeline.
 * It combines the system prompt, conversation history, retrieved context, and user query
 * to generate high-quality, PLC-focused coaching responses.
 */

import OpenAI from 'openai';
import type { RetrievedChunk } from './retrieval';

// Lazy-load OpenAI client to allow environment variables to be set first
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openaiClient;
}

// Message type for conversation history
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * System Prompt - Expert PLC Coach Persona
 *
 * Based on PRD Section 4.1.2, this prompt creates a Solution Tree PLC at Work® Associate
 * coaching persona with 15+ years of experience.
 */
const SYSTEM_PROMPT = `You are an expert Solution Tree PLC at Work® Associate with 15+ years of experience coaching educational leaders and collaborative teams.

Your coaching style is:

1. FACILITATIVE: Ask powerful questions that surface team thinking rather than immediately providing answers.

2. FRAMEWORK-GROUNDED: Every response is anchored in the Three Big Ideas (Focus on Learning, Collaborative Culture, Focus on Results) and guides teams through the Four Critical Questions.

3. INQUIRY-BASED: When a team presents a challenge, first ask clarifying questions:
   - "What data are you using to reach that conclusion?"
   - "How have you aligned this to your essential learning outcomes?"
   - "What have you tried so far?"

4. ACTIONABLE: After inquiry, provide specific, concrete next steps with clear rationale.

5. CITATION-CONSCIOUS: Reference specific Solution Tree resources to build credibility and enable follow-up learning.

YOUR COACHING PROCESS:
Step 1: Acknowledge the challenge empathetically
Step 2: Ask 1-2 clarifying questions to understand context
Step 3: Connect to the PLC framework (Which Critical Question? Which Big Idea?)
Step 4: Provide actionable guidance with specific examples
Step 5: Cite the source document [Source: Document Name, Section/Chapter]

CRITICAL RULES:
- Never provide generic advice that could come from any AI
- Always ground responses in the PLC at Work framework
- Use the term "collaborative team" not "group" or "committee"
- Reference the Four Critical Questions by number
- Include at least one citation per substantive response
- Format citations as: [Source: Document Name, Section/Chapter]`;

/**
 * Format retrieved chunks for LLM prompt
 *
 * Converts retrieved chunks into a structured format that the LLM can use
 * to ground its responses in the knowledge base.
 */
function formatChunksForPrompt(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      const cqDisplay = chunk.metadata.criticalQuestion || 'General';
      const section = chunk.metadata.section || 'N/A';
      const author = chunk.metadata.author || 'Unknown';

      return `[Context ${index + 1}]
Source: ${chunk.metadata.sourceDocument}
Author: ${author}
Section: ${section}
Critical Question: ${cqDisplay}
Category: ${chunk.metadata.category}
Relevance Score: ${chunk.adjustedScore.toFixed(3)}

Content:
${chunk.content}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Format conversation history for OpenAI API
 */
function formatConversationHistory(history: Message[]): Array<{
  role: 'user' | 'assistant' | 'system';
  content: string;
}> {
  return history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate response with retry logic
 *
 * Implements exponential backoff for rate limiting and transient errors.
 */
async function generateWithRetry(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  retries = 3
): Promise<string> {
  const openai = getOpenAIClient();

  for (let i = 0; i < retries; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error(`Generation attempt ${i + 1} failed:`, error.message);

      // If last retry, throw error
      if (i === retries - 1) {
        throw new Error(`Failed to generate response after ${retries} attempts: ${error.message}`);
      }

      // Rate limit - wait longer
      if (error.status === 429) {
        const waitTime = 5000 * Math.pow(2, i);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      } else {
        // Other error - shorter wait
        const waitTime = 1000 * Math.pow(2, i);
        console.log(`Error occurred. Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      }
    }
  }

  throw new Error('Failed after retries');
}

/**
 * Main generation function
 *
 * This is the primary entry point for generating LLM responses.
 * It takes the user query, retrieved chunks, and conversation history,
 * and returns a coaching response grounded in the PLC framework.
 */
export async function generateResponse(params: {
  userQuery: string;
  retrievedChunks: RetrievedChunk[];
  conversationHistory: Message[];
}): Promise<string> {
  const { userQuery, retrievedChunks, conversationHistory } = params;

  try {
    // Build messages array for OpenAI API
    const messages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }> = [
      // System prompt with PLC Coach persona
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      // Conversation history (recent messages)
      ...formatConversationHistory(conversationHistory),
      // Retrieved context from knowledge base
      {
        role: 'system',
        content: `Relevant context from knowledge base:\n\n${formatChunksForPrompt(retrievedChunks)}`,
      },
      // Current user query
      {
        role: 'user',
        content: userQuery,
      },
    ];

    // Generate response with retry logic
    const response = await generateWithRetry(messages);

    return response;
  } catch (error: any) {
    console.error('Generation error:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Get system prompt (exported for testing/debugging)
 */
export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}
