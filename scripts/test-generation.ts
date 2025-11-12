#!/usr/bin/env tsx

/**
 * Test LLM Response Generation
 *
 * This script tests the generation module with the RAG pipeline.
 * It verifies that GPT-4o generates appropriate PLC coaching responses.
 */

import { readFileSync } from 'fs';
import * as path from 'path';
import { retrieveContext } from '../app/lib/rag/retrieval';
import { generateResponse } from '../app/lib/rag/generation';

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

async function testGeneration() {
  console.log('🧪 Testing LLM Response Generation\n');
  console.log('='.repeat(70));
  console.log();

  const testQuery = 'How do we analyze CFA data effectively?';
  console.log(`User Query: "${testQuery}"\n`);

  try {
    // Step 1: Retrieve context
    console.log('⏳ Step 1: Retrieving context from knowledge base...');
    const startRetrieval = Date.now();

    const retrievedChunks = await retrieveContext(testQuery, { topK: 5 });

    const retrievalTime = Date.now() - startRetrieval;
    console.log(`   Retrieved ${retrievedChunks.length} chunks in ${retrievalTime}ms\n`);

    // Step 2: Generate response
    console.log('⏳ Step 2: Generating response with GPT-4o...');
    const startGeneration = Date.now();

    const response = await generateResponse({
      userQuery: testQuery,
      retrievedChunks,
      conversationHistory: [],
    });

    const generationTime = Date.now() - startGeneration;
    console.log(`   Generated response in ${generationTime}ms\n`);

    // Display results
    console.log('='.repeat(70));
    console.log('RESPONSE:\n');
    console.log(response);
    console.log();
    console.log('='.repeat(70));
    console.log();

    // Analyze response quality
    console.log('📊 Response Quality Analysis:\n');

    const hasFrameworkReference =
      response.toLowerCase().includes('critical question') ||
      response.toLowerCase().includes('big idea') ||
      response.toLowerCase().includes('plc');

    const hasCitation = /\[Source:.*\]/.test(response);

    const hasActionableGuidance =
      response.includes('?') || // Asks questions
      response.toLowerCase().includes('try') ||
      response.toLowerCase().includes('consider') ||
      response.toLowerCase().includes('step');

    console.log(`   Framework-grounded: ${hasFrameworkReference ? '✅' : '❌'}`);
    console.log(`   Citation included: ${hasCitation ? '✅' : '❌'}`);
    console.log(`   Actionable guidance: ${hasActionableGuidance ? '✅' : '❌'}`);
    console.log(`   Response length: ${response.length} characters`);
    console.log(`   Word count: ${response.split(/\s+/).length} words`);
    console.log();

    // Performance metrics
    console.log('⚡ Performance Metrics:\n');
    console.log(`   Retrieval time: ${retrievalTime}ms`);
    console.log(`   Generation time: ${generationTime}ms`);
    console.log(`   Total time: ${retrievalTime + generationTime}ms`);
    console.log();

    const totalTime = retrievalTime + generationTime;
    if (totalTime < 2000) {
      console.log('   ✅ Performance: Excellent (< 2s)');
    } else if (totalTime < 3000) {
      console.log('   ✅ Performance: Good (< 3s)');
    } else {
      console.log('   ⚠️  Performance: Acceptable but could be improved');
    }
    console.log();

    // Final verdict
    console.log('='.repeat(70));
    console.log();

    const allChecks = hasFrameworkReference && hasCitation && hasActionableGuidance;

    if (allChecks) {
      console.log('✅ GENERATION MODULE WORKING');
      console.log('   Response quality meets all criteria');
      console.log('   Ready for integration into /api/chat\n');
    } else {
      console.log('⚠️  GENERATION MODULE NEEDS IMPROVEMENT');
      console.log('   Some quality criteria not met');
      console.log('   Review system prompt or test query\n');
    }
  } catch (error: any) {
    console.error('❌ Generation Test Error:');
    console.error(error.message);
    console.error();
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run test
testGeneration();
