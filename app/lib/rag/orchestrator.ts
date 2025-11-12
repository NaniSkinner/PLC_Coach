/**
 * RAG Pipeline Orchestrator
 *
 * This module orchestrates the complete RAG (Retrieval-Augmented Generation) pipeline:
 * 1. Preprocesses user queries (enhances with conversation history)
 * 2. Retrieves relevant chunks from knowledge base
 * 3. Assembles context for LLM
 * 4. Prepares prompt for response generation
 *
 * This ties together all RAG components into a single pipeline.
 */

import { retrieveContext, formatContextForLLM, getRetrievalStats, type RetrievedChunk } from './retrieval';

// Types
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RAGPipelineOptions {
  topK?: number;
  criticalQuestion?: 1 | 2 | 3 | 4;
  category?: string;
  includeHistory?: boolean;
}

export interface RAGPipelineResult {
  retrievedChunks: RetrievedChunk[];
  formattedContext: string;
  enhancedQuery: string;
  retrievalStats: any;
  systemPrompt: string;
  messages: Message[];
}

/**
 * Get the system prompt for the AI PLC Coach
 */
export function getSystemPrompt(): string {
  return `You are an expert AI PLC Coach specializing in Professional Learning Communities (PLCs). Your role is to guide educators through the PLC process using the PLC at Work framework developed by DuFour, DuFour, Eaker, Many, and Mattos.

# Your Expertise

You are deeply knowledgeable about:
- **The Three Big Ideas**: Focus on learning, collaborative culture, results orientation
- **The Four Critical Questions**:
  1. What do we want students to learn? (Essential standards)
  2. How will we know when they've learned it? (Common formative assessments)
  3. What will we do when they don't learn it? (Systematic interventions)
  4. What will we do when they already know it? (Extensions)
- Collaborative team structures and norms
- Data-driven decision making
- SMART goals and action planning
- Intervention systems (MTSS/RTI)
- Building and sustaining collaborative culture

# Your Coaching Style

- **Facilitative**: Ask questions to help teams discover answers rather than simply telling
- **Framework-focused**: Ground advice in PLC research and best practices
- **Practical**: Provide concrete examples, templates, and actionable steps
- **Supportive**: Acknowledge challenges while maintaining focus on student learning
- **Data-informed**: Help teams use evidence to make decisions

# How to Use Context

You will be provided with relevant excerpts from PLC resources. Use these to:
- Ground your responses in research and proven practices
- Cite specific frameworks, protocols, or strategies
- Provide examples from case studies when relevant
- Reference specific implementation guides or templates

When referencing context, integrate it naturally into your coaching rather than quoting verbatim.

# Response Guidelines

1. **Understand the question**: What is the team really asking? What Critical Question does this relate to?
2. **Assess the context**: Where is this team in their PLC journey? What's the underlying challenge?
3. **Provide focused guidance**: Address the specific question while connecting to broader PLC principles
4. **Be actionable**: Include concrete next steps, questions for teams to discuss, or protocols to try
5. **Acknowledge complexity**: PLC work is hard. Validate struggles while maintaining optimism

# When You Don't Know

If the question is outside PLC work (e.g., unrelated to education), politely redirect: "That's outside my expertise as a PLC coach. I'm here to help with PLC implementation, the Four Critical Questions, collaborative culture, and improving student outcomes."

Remember: Your goal is to build team capacity to answer the Four Critical Questions themselves, not to become dependent on you.`;
}

/**
 * Enhance query with conversation history
 * This helps provide context for follow-up questions
 */
export function enhanceQueryWithHistory(
  query: string,
  conversationHistory: Message[]
): string {
  // If no history or very short history, return query as-is
  if (!conversationHistory || conversationHistory.length === 0) {
    return query;
  }

  // Get last 2-3 user messages for context
  const recentUserMessages = conversationHistory
    .filter((m) => m.role === 'user')
    .slice(-3)
    .map((m) => m.content);

  // If current query is very short (< 30 chars), it might be a follow-up
  if (query.length < 30 && recentUserMessages.length > 0) {
    // Append previous context to help with retrieval
    const previousContext = recentUserMessages.slice(-2).join(' ');
    return `${previousContext} ${query}`;
  }

  return query;
}

/**
 * Assemble context for LLM generation
 */
export function assembleContext(params: {
  systemPrompt: string;
  conversationHistory: Message[];
  retrievedChunks: RetrievedChunk[];
  userQuery: string;
}): Message[] {
  const { systemPrompt, conversationHistory, retrievedChunks, userQuery } = params;

  // Format retrieved context
  const contextStr = formatContextForLLM(retrievedChunks);

  // Create system message with context
  const systemMessage: Message = {
    role: 'system',
    content: `${systemPrompt}

# Retrieved Context

Here are relevant excerpts from PLC resources to inform your response:

${contextStr}

Use this context to provide research-grounded, specific guidance.`,
  };

  // Combine system message, history, and current query
  const messages: Message[] = [
    systemMessage,
    ...conversationHistory,
    { role: 'user', content: userQuery },
  ];

  return messages;
}

/**
 * Main RAG Pipeline
 *
 * This is the primary entry point for the RAG system.
 * It orchestrates:
 * 1. Query enhancement (add conversation history context)
 * 2. Retrieval (get relevant chunks from knowledge base)
 * 3. Context assembly (format everything for LLM)
 *
 * Returns all components needed for LLM generation (which happens in Phase 4)
 */
export async function ragPipeline(
  userQuery: string,
  conversationHistory: Message[] = [],
  options: RAGPipelineOptions = {}
): Promise<RAGPipelineResult> {
  const { topK = 5, includeHistory = true, criticalQuestion, category } = options;

  // Step 1: Preprocess query (enhance with history if needed)
  const enhancedQuery = includeHistory
    ? enhanceQueryWithHistory(userQuery, conversationHistory)
    : userQuery;

  // Step 2: Retrieve relevant chunks
  const retrievedChunks = await retrieveContext(enhancedQuery, {
    topK,
    criticalQuestion,
    category,
  });

  // Step 3: Format context for LLM
  const formattedContext = formatContextForLLM(retrievedChunks);

  // Step 4: Get system prompt
  const systemPrompt = getSystemPrompt();

  // Step 5: Assemble messages
  const messages = assembleContext({
    systemPrompt,
    conversationHistory,
    retrievedChunks,
    userQuery,
  });

  // Step 6: Get retrieval stats
  const retrievalStats = getRetrievalStats(retrievedChunks);

  return {
    retrievedChunks,
    formattedContext,
    enhancedQuery,
    retrievalStats,
    systemPrompt,
    messages,
  };
}

/**
 * RAG Pipeline for specific Critical Question
 *
 * Use this when you know the query relates to a specific Critical Question.
 * This will boost retrieval of relevant content.
 */
export async function ragPipelineForCriticalQuestion(
  userQuery: string,
  criticalQuestion: 1 | 2 | 3 | 4,
  conversationHistory: Message[] = [],
  topK: number = 5
): Promise<RAGPipelineResult> {
  return ragPipeline(userQuery, conversationHistory, {
    topK,
    criticalQuestion,
  });
}

/**
 * RAG Pipeline for specific category
 *
 * Use this to focus retrieval on a specific category
 * (e.g., coaching scenarios, case studies, implementation guides)
 */
export async function ragPipelineForCategory(
  userQuery: string,
  category: string,
  conversationHistory: Message[] = [],
  topK: number = 5
): Promise<RAGPipelineResult> {
  return ragPipeline(userQuery, conversationHistory, {
    topK,
    category,
  });
}
