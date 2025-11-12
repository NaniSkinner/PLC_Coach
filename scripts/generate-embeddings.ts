#!/usr/bin/env tsx

/**
 * Generate Embeddings for Document Chunks
 *
 * This script:
 * 1. Reads chunks from scripts/output/chunks.json
 * 2. Generates embeddings using OpenAI text-embedding-3-large
 * 3. Processes in batches of 100 (with rate limiting)
 * 4. Outputs embedded chunks to scripts/output/embedded-chunks.json
 *
 * Model: text-embedding-3-large
 * Dimensions: 3072
 * Cost: ~$0.13 per 1M tokens
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

// Types
interface Chunk {
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
}

interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

// Configuration
const BATCH_SIZE = 100; // OpenAI supports up to 2048, but 100 is safer
const RATE_LIMIT_DELAY = 1000; // 1 second between batches
const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'output');
const CHUNKS_FILE = path.join(OUTPUT_DIR, 'chunks.json');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'embedded-chunks.json');

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

const OPENAI_API_KEY = envVars.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate embeddings for a batch of chunks
 */
async function generateEmbeddingsBatch(
  openai: OpenAI,
  chunks: Chunk[]
): Promise<EmbeddedChunk[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: chunks.map((c) => c.content),
      dimensions: 3072,
    });

    // Combine chunks with their embeddings
    const embeddedChunks: EmbeddedChunk[] = chunks.map((chunk, idx) => ({
      ...chunk,
      embedding: response.data[idx].embedding,
    }));

    return embeddedChunks;
  } catch (error: any) {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Generate embeddings for all chunks with progress tracking
 */
async function generateAllEmbeddings() {
  console.log('🧠 Embedding Generation Pipeline\n');
  console.log('='.repeat(50));
  console.log();

  // Check if chunks file exists
  if (!existsSync(CHUNKS_FILE)) {
    console.error(`❌ Error: Chunks file not found at ${CHUNKS_FILE}`);
    console.error('   Run "bun run kb:chunk" first to generate chunks.\n');
    process.exit(1);
  }

  // Load chunks
  console.log(`📂 Loading chunks from ${path.basename(CHUNKS_FILE)}...`);
  const chunks: Chunk[] = JSON.parse(readFileSync(CHUNKS_FILE, 'utf-8'));
  console.log(`✅ Loaded ${chunks.length} chunks\n`);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  console.log('⚙️  Configuration:');
  console.log(`   Model: text-embedding-3-large`);
  console.log(`   Dimensions: 3072`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Total batches: ${Math.ceil(chunks.length / BATCH_SIZE)}`);
  console.log();

  // Calculate cost estimate
  const totalTokens = chunks.reduce((sum, c) => sum + c.metadata.estimatedTokens, 0);
  const estimatedCost = (totalTokens / 1_000_000) * 0.13;
  console.log('💰 Cost Estimate:');
  console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`   Estimated cost: $${estimatedCost.toFixed(4)}\n`);

  // Process in batches
  const allEmbeddedChunks: EmbeddedChunk[] = [];
  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
  let successfulBatches = 0;
  let failedBatches = 0;

  console.log('🔄 Generating embeddings...\n');

  const startTime = Date.now();

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const batch = chunks.slice(i, i + BATCH_SIZE);

    try {
      const embeddedBatch = await generateEmbeddingsBatch(openai, batch);
      allEmbeddedChunks.push(...embeddedBatch);
      successfulBatches++;

      const progress = ((i + batch.length) / chunks.length) * 100;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      process.stdout.write(
        `   Batch ${batchNumber}/${totalBatches} (${progress.toFixed(1)}%) - ` +
          `${i + batch.length}/${chunks.length} chunks - ` +
          `${elapsed}s elapsed\r`
      );

      // Rate limiting (except for last batch)
      if (i + BATCH_SIZE < chunks.length) {
        await sleep(RATE_LIMIT_DELAY);
      }
    } catch (error: any) {
      failedBatches++;
      console.error(`\n❌ Error in batch ${batchNumber}: ${error.message}`);

      // Retry once after delay
      console.log(`   Retrying batch ${batchNumber}...`);
      await sleep(5000);

      try {
        const embeddedBatch = await generateEmbeddingsBatch(openai, batch);
        allEmbeddedChunks.push(...embeddedBatch);
        successfulBatches++;
        failedBatches--;
        console.log(`   ✅ Retry successful\n`);
      } catch (retryError: any) {
        console.error(`   ❌ Retry failed: ${retryError.message}\n`);
        // Continue with next batch instead of failing completely
      }
    }
  }

  console.log('\n');
  console.log('='.repeat(50));
  console.log();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('📊 Embedding Summary:');
  console.log(`   Total chunks: ${chunks.length}`);
  console.log(`   Successfully embedded: ${allEmbeddedChunks.length}`);
  console.log(`   Failed chunks: ${chunks.length - allEmbeddedChunks.length}`);
  console.log(`   Successful batches: ${successfulBatches}`);
  console.log(`   Failed batches: ${failedBatches}`);
  console.log(`   Total time: ${totalTime}s`);
  console.log(`   Average time per batch: ${(parseFloat(totalTime) / totalBatches).toFixed(2)}s`);
  console.log();

  // Save embedded chunks
  console.log(`💾 Saving embedded chunks to ${path.basename(OUTPUT_FILE)}...`);
  writeFileSync(OUTPUT_FILE, JSON.stringify(allEmbeddedChunks, null, 2));
  console.log(`✅ Embedded chunks saved!\n`);

  // Verify embeddings
  console.log('🔍 Verification:');
  const sampleChunk = allEmbeddedChunks[0];
  if (sampleChunk && sampleChunk.embedding) {
    console.log(`   Embedding dimensions: ${sampleChunk.embedding.length}`);
    console.log(`   Sample embedding values (first 5): [${sampleChunk.embedding.slice(0, 5).map((v) => v.toFixed(6)).join(', ')}...]`);
    console.log(`   Embedding vector magnitude: ${Math.sqrt(sampleChunk.embedding.reduce((sum, v) => sum + v * v, 0)).toFixed(6)}`);
  }
  console.log();

  if (allEmbeddedChunks.length === chunks.length) {
    console.log('✅ Embedding generation complete!');
    console.log('   All chunks successfully embedded.');
    console.log('   You can now proceed to Pinecone upload (Task 3.4)\n');
  } else {
    console.log('⚠️  Embedding generation completed with errors.');
    console.log(`   ${chunks.length - allEmbeddedChunks.length} chunks failed to embed.`);
    console.log('   You may want to retry failed chunks or proceed with partial data.\n');
  }
}

// Run the script
generateAllEmbeddings().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
