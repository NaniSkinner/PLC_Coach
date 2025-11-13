#!/usr/bin/env tsx

/**
 * Upload Embedded Chunks to Pinecone
 *
 * This script:
 * 1. Reads embedded chunks from scripts/output/embedded-chunks.json
 * 2. Formats vectors for Pinecone (id, values, metadata)
 * 3. Uploads in batches of 100 vectors
 * 4. Verifies upload success
 *
 * Pinecone Configuration:
 * - Index: plc-coach-demo
 * - Batch size: 100 vectors per upsert
 * - Includes full metadata with each vector
 */

import { readFileSync, existsSync } from 'fs';
import * as path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

// Types
interface EmbeddedChunk {
  chunkId: string;
  content: string;
  metadata: {
    sourceDocument: string;
    sourceFile: string;
    category: string;
    title: string;
    author?: string;
    criticalQuestion?: number[];
    topics: string[];
    documentType: string;
    chunkIndex: number;
    totalChunks: number;
    estimatedTokens: number;
  };
  embedding: number[];
}

interface PineconeVector {
  id: string;
  values: number[];
  metadata: {
    content: string;
    sourceDocument: string;
    sourceFile: string;
    category: string;
    title: string;
    author?: string;
    criticalQuestion: string; // Pinecone metadata must be strings/numbers
    topics: string;
    documentType: string;
    chunkIndex: number;
    totalChunks: number;
    estimatedTokens: number;
  };
}

// Configuration
const BATCH_SIZE = 100;
const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'output');
const EMBEDDED_CHUNKS_FILE = path.join(OUTPUT_DIR, 'embedded-chunks.json');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const PINECONE_API_KEY = envVars.PINECONE_API_KEY || process.env.PINECONE_API_KEY;
const INDEX_NAME = envVars.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX_NAME || 'plc-coach-demo';

if (!PINECONE_API_KEY) {
  console.error('❌ Error: PINECONE_API_KEY not found in .env.local');
  process.exit(1);
}

/**
 * Convert embedded chunk to Pinecone vector format
 */
function chunkToPineconeVector(chunk: EmbeddedChunk): PineconeVector {
  return {
    id: chunk.chunkId,
    values: chunk.embedding,
    metadata: {
      content: chunk.content,
      sourceDocument: chunk.metadata.sourceDocument,
      sourceFile: chunk.metadata.sourceFile,
      category: chunk.metadata.category,
      title: chunk.metadata.title,
      author: chunk.metadata.author,
      criticalQuestion: chunk.metadata.criticalQuestion?.join(',') || 'none',
      topics: chunk.metadata.topics.join(', '),
      documentType: chunk.metadata.documentType,
      chunkIndex: chunk.metadata.chunkIndex,
      totalChunks: chunk.metadata.totalChunks,
      estimatedTokens: chunk.metadata.estimatedTokens,
    },
  };
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Upload all vectors to Pinecone
 */
async function uploadToPinecone() {
  console.log('☁️  Pinecone Upload Pipeline\n');
  console.log('='.repeat(50));
  console.log();

  // Check if embedded chunks file exists
  if (!existsSync(EMBEDDED_CHUNKS_FILE)) {
    console.error(`❌ Error: Embedded chunks file not found at ${EMBEDDED_CHUNKS_FILE}`);
    console.error('   Run "bun run kb:embed" first to generate embeddings.\n');
    process.exit(1);
  }

  // Load embedded chunks
  console.log(`📂 Loading embedded chunks from ${path.basename(EMBEDDED_CHUNKS_FILE)}...`);
  const embeddedChunks: EmbeddedChunk[] = JSON.parse(
    readFileSync(EMBEDDED_CHUNKS_FILE, 'utf-8')
  );
  console.log(`✅ Loaded ${embeddedChunks.length} embedded chunks\n`);

  // Initialize Pinecone client
  console.log('🔌 Connecting to Pinecone...');
  const pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY!,
  });

  const index = pinecone.index(INDEX_NAME);
  console.log(`✅ Connected to index: ${INDEX_NAME}\n`);

  // Get current index stats
  console.log('📊 Current index stats:');
  try {
    const stats = await index.describeIndexStats();
    console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
    console.log(`   Dimensions: ${stats.dimension || 'unknown'}`);
    console.log();
  } catch (error: any) {
    console.log(`   Unable to fetch stats: ${error.message}`);
    console.log();
  }

  // Convert chunks to Pinecone vectors
  console.log('🔄 Converting chunks to Pinecone format...');
  const vectors = embeddedChunks.map(chunkToPineconeVector);
  console.log(`✅ Converted ${vectors.length} vectors\n`);

  // Upload in batches
  console.log(`⬆️  Uploading vectors (batch size: ${BATCH_SIZE})...\n`);

  const totalBatches = Math.ceil(vectors.length / BATCH_SIZE);
  let successfulBatches = 0;
  let failedBatches = 0;
  const startTime = Date.now();

  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const batch = vectors.slice(i, i + BATCH_SIZE);

    try {
      await index.upsert(batch);
      successfulBatches++;

      const progress = ((i + batch.length) / vectors.length) * 100;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      process.stdout.write(
        `   Batch ${batchNumber}/${totalBatches} (${progress.toFixed(1)}%) - ` +
          `${i + batch.length}/${vectors.length} vectors - ` +
          `${elapsed}s elapsed\r`
      );

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < vectors.length) {
        await sleep(100);
      }
    } catch (error: any) {
      failedBatches++;
      console.error(`\n❌ Error uploading batch ${batchNumber}: ${error.message}`);

      // Retry once after delay
      console.log(`   Retrying batch ${batchNumber}...`);
      await sleep(2000);

      try {
        await index.upsert(batch);
        successfulBatches++;
        failedBatches--;
        console.log(`   ✅ Retry successful\n`);
      } catch (retryError: any) {
        console.error(`   ❌ Retry failed: ${retryError.message}\n`);
        // Continue with next batch
      }
    }
  }

  console.log('\n');
  console.log('='.repeat(50));
  console.log();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('📊 Upload Summary:');
  console.log(`   Total vectors: ${vectors.length}`);
  console.log(`   Successful batches: ${successfulBatches}/${totalBatches}`);
  console.log(`   Failed batches: ${failedBatches}`);
  console.log(`   Total time: ${totalTime}s`);
  console.log();

  // Wait a moment for Pinecone to index
  console.log('⏳ Waiting for Pinecone to index vectors (5 seconds)...');
  await sleep(5000);

  // Verify upload
  console.log('🔍 Verifying upload...');
  try {
    const stats = await index.describeIndexStats();
    console.log(`✅ Index now contains ${stats.totalRecordCount || 0} vectors\n`);

    if (stats.totalRecordCount && stats.totalRecordCount >= vectors.length) {
      console.log('✅ Upload verification successful!');
      console.log('   All vectors are in Pinecone.');
      console.log('   You can now proceed to retrieval system implementation (Task 3.5)\n');
    } else {
      console.log('⚠️  Upload verification incomplete.');
      console.log(`   Expected ${vectors.length} vectors, found ${stats.totalRecordCount || 0}`);
      console.log('   Pinecone may still be indexing. Wait a minute and check again.\n');
    }
  } catch (error: any) {
    console.error(`❌ Error verifying upload: ${error.message}`);
    console.log('   The upload may have succeeded, but verification failed.');
    console.log('   Check the Pinecone dashboard to confirm.\n');
  }

  // Test a sample query
  console.log('🧪 Testing sample query...');
  try {
    const queryResult = await index.query({
      vector: vectors[0].values,
      topK: 3,
      includeMetadata: true,
    });

    if (queryResult.matches && queryResult.matches.length > 0) {
      console.log(`✅ Sample query successful! Found ${queryResult.matches.length} matches\n`);
      console.log('   Top match:');
      console.log(`   ID: ${queryResult.matches[0].id}`);
      console.log(`   Score: ${queryResult.matches[0].score?.toFixed(4)}`);
      console.log(`   Title: ${(queryResult.matches[0].metadata as any)?.title || 'N/A'}`);
      console.log();
    } else {
      console.log('⚠️  Sample query returned no results. Index may still be initializing.\n');
    }
  } catch (error: any) {
    console.error(`❌ Sample query failed: ${error.message}\n`);
  }

  console.log('✅ Pinecone upload complete!\n');
}

// Run the script
uploadToPinecone().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
