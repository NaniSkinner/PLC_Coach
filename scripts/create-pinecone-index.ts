#!/usr/bin/env tsx

/**
 * Create Pinecone Index for PLC Coach Demo
 *
 * This script creates a new Pinecone index with:
 * - Dimension: 3072 (text-embedding-3-large)
 * - Metric: cosine similarity
 * - Region: us-east-1
 * - Serverless architecture
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { readFileSync } from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
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

async function createPineconeIndex() {
  console.log('🚀 Creating Pinecone Index...\n');

  try {
    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY!,
    });

    console.log(`📝 Index Configuration:`);
    console.log(`   Name: ${INDEX_NAME}`);
    console.log(`   Dimension: 3072`);
    console.log(`   Metric: cosine`);
    console.log(`   Cloud: AWS`);
    console.log(`   Region: us-east-1\n`);

    // Check if index already exists
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes?.some(
      (index) => index.name === INDEX_NAME
    );

    if (indexExists) {
      console.log(`⚠️  Index "${INDEX_NAME}" already exists.`);
      console.log('   Skipping creation.\n');

      // Get index info
      const indexDescription = await pinecone.describeIndex(INDEX_NAME);
      console.log('📊 Existing Index Info:');
      console.log(`   Status: ${indexDescription.status?.state || 'unknown'}`);
      console.log(`   Dimension: ${indexDescription.dimension}`);
      console.log(`   Metric: ${indexDescription.metric}`);

      return;
    }

    // Create the index
    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: 3072,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });

    console.log('✅ Index creation initiated successfully!\n');
    console.log('⏳ Index is being created (this may take 1-2 minutes)...\n');

    // Wait for index to be ready
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 5 seconds = 2.5 minutes max

    while (!isReady && attempts < maxAttempts) {
      attempts++;

      try {
        const indexDescription = await pinecone.describeIndex(INDEX_NAME);

        if (indexDescription.status?.state === 'Ready') {
          isReady = true;
          console.log('✅ Index is ready!\n');
          console.log('📊 Final Index Info:');
          console.log(`   Name: ${indexDescription.name}`);
          console.log(`   Dimension: ${indexDescription.dimension}`);
          console.log(`   Metric: ${indexDescription.metric}`);
          console.log(`   Host: ${indexDescription.host}\n`);
        } else {
          process.stdout.write(`   Waiting... (attempt ${attempts}/${maxAttempts})\r`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error) {
        // Index might not be queryable yet, keep waiting
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    if (!isReady) {
      console.log('\n⚠️  Index creation is taking longer than expected.');
      console.log('   Check the Pinecone dashboard to verify status.');
      console.log('   The index may still be initializing.\n');
    }

    console.log('✅ Pinecone index setup complete!');
    console.log('   You can now proceed to document chunking (Task 3.2)\n');

  } catch (error: any) {
    console.error('❌ Error creating Pinecone index:');
    console.error(error.message);

    if (error.message?.includes('ALREADY_EXISTS')) {
      console.log('\n💡 The index already exists. You can proceed to the next step.');
    } else {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Check your PINECONE_API_KEY in .env.local');
      console.error('   2. Verify your Pinecone account has available indexes (free tier = 1 index)');
      console.error('   3. Check the Pinecone dashboard: https://app.pinecone.io/');
    }

    process.exit(1);
  }
}

// Run the script
createPineconeIndex();
