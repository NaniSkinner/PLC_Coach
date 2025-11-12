#!/usr/bin/env tsx

/**
 * Test Citation Extraction
 *
 * This script tests the citation extraction module.
 */

import { readFileSync } from 'fs';
import * as path from 'path';
import { retrieveContext } from '../app/lib/rag/retrieval';
import { generateResponse } from '../app/lib/rag/generation';
import { extractCitations, formatCitation } from '../app/lib/rag/citations';

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

async function testCitations() {
  console.log('🧪 Testing Citation Extraction\n');
  console.log('='.repeat(70));
  console.log();

  const testQuery = 'What are the Four Critical Questions?';
  console.log(`User Query: "${testQuery}"\n`);

  try {
    // Retrieve and generate
    console.log('⏳ Retrieving context and generating response...\n');

    const retrievedChunks = await retrieveContext(testQuery, { topK: 5 });

    const response = await generateResponse({
      userQuery: testQuery,
      retrievedChunks,
      conversationHistory: [],
    });

    console.log('Response:\n');
    console.log(response);
    console.log();
    console.log('='.repeat(70));
    console.log();

    // Extract citations
    console.log('⏳ Extracting citations...\n');

    const { content, citations } = extractCitations(response, retrievedChunks);

    console.log(`Found ${citations.length} citation(s):\n`);

    citations.forEach((citation, i) => {
      console.log(`${i + 1}. ${formatCitation(citation)}`);
      console.log(`   Relevance Score: ${citation.relevanceScore.toFixed(3)}`);
      console.log();
    });

    console.log('='.repeat(70));
    console.log();

    // Validation
    if (citations.length === 0) {
      console.log('❌ FAILED: No citations found');
      process.exit(1);
    }

    console.log('✅ CITATION EXTRACTION WORKING');
    console.log(`   ${citations.length} citation(s) extracted and formatted\n`);
  } catch (error: any) {
    console.error('❌ Citation Test Error:');
    console.error(error.message);
    process.exit(1);
  }
}

testCitations();
