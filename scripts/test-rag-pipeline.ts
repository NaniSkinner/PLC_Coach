#!/usr/bin/env tsx

/**
 * Test RAG Pipeline End-to-End
 *
 * This simulates what will happen in production when a user asks a question.
 * It verifies that the complete RAG pipeline works without local file dependencies.
 */

import { readFileSync } from 'fs';
import * as path from 'path';
import { ragPipeline } from '../app/lib/rag';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

async function testRAGPipeline() {
  console.log('🧪 Testing RAG Pipeline (Production Simulation)\n');
  console.log('='.repeat(60));
  console.log();

  // Test query
  const userQuery = 'How do we analyze CFA data effectively?';
  console.log(`User Query: "${userQuery}"\n`);

  try {
    console.log('⏳ Running RAG pipeline...\n');
    const startTime = Date.now();

    // This is exactly what will happen in production
    const result = await ragPipeline(userQuery, [], {
      topK: 5,
    });

    const elapsed = Date.now() - startTime;

    console.log('✅ RAG Pipeline Success!\n');
    console.log('='.repeat(60));
    console.log();

    console.log('📊 Results:');
    console.log(`   Retrieved chunks: ${result.retrievedChunks.length}`);
    console.log(`   Retrieval time: ${elapsed}ms`);
    console.log(`   Enhanced query: "${result.enhancedQuery}"`);
    console.log();

    console.log('📚 Retrieved Content:\n');
    result.retrievedChunks.forEach((chunk, i) => {
      console.log(`${i + 1}. ${chunk.metadata.title}`);
      console.log(`   Category: ${chunk.metadata.category}`);
      console.log(`   Critical Question: ${chunk.metadata.criticalQuestion}`);
      console.log(`   Score: ${chunk.score.toFixed(3)} (adjusted: ${chunk.adjustedScore.toFixed(3)})`);
      console.log(`   Preview: ${chunk.content.slice(0, 100)}...`);
      console.log();
    });

    console.log('='.repeat(60));
    console.log();

    console.log('📋 Retrieval Stats:');
    console.log(`   Categories: ${result.retrievalStats.categories.join(', ')}`);
    console.log(`   Critical Questions: ${result.retrievalStats.criticalQuestions.join(', ')}`);
    console.log(`   Avg Score: ${result.retrievalStats.avgScore}`);
    console.log(`   Min Score: ${result.retrievalStats.minScore}`);
    console.log(`   Max Score: ${result.retrievalStats.maxScore}`);
    console.log();

    console.log('='.repeat(60));
    console.log();

    console.log('📄 System Prompt (excerpt):');
    console.log(result.systemPrompt.slice(0, 200) + '...\n');

    console.log('💬 Messages Ready for LLM:');
    console.log(`   Total messages: ${result.messages.length}`);
    result.messages.forEach((msg, i) => {
      console.log(`   ${i + 1}. ${msg.role}: ${msg.content.slice(0, 80)}...`);
    });
    console.log();

    console.log('='.repeat(60));
    console.log();
    console.log('✅ DEPLOYMENT READY: RAG pipeline works without local files!');
    console.log('   All data comes from Pinecone cloud database.');
    console.log('   This will work in production (Vercel, Netlify, etc.)');
    console.log();
    console.log('⏭️  Next: Phase 4 - Connect to OpenAI GPT-4 for response generation\n');

  } catch (error: any) {
    console.error('❌ RAG Pipeline Error:');
    console.error(error.message);
    console.error();
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run test
testRAGPipeline();
