#!/usr/bin/env tsx

/**
 * Document Chunking for RAG Pipeline
 *
 * This script:
 * 1. Reads all markdown documents from scripts/knowledge_base/
 * 2. Parses frontmatter metadata
 * 3. Chunks each document into ~500 token pieces
 * 4. Maintains 50-token overlap for context continuity
 * 5. Preserves metadata at chunk level
 * 6. Outputs chunks to scripts/output/chunks.json
 *
 * Chunking Strategy:
 * - Respects paragraph boundaries (never split mid-paragraph)
 * - Maintains semantic coherence
 * - Includes source document reference
 * - Adds unique chunk IDs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// Types
interface DocumentMetadata {
  title: string;
  type: string;
  topics: string[];
  critical_question?: number | number[];
  author?: string;
  publication_year?: number;
  school_level?: string;
  timeline?: string;
  outcome?: string;
  document_type?: string;
  [key: string]: any;
}

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

// Configuration
const CHUNK_SIZE_CHARS = 2000; // ~500 tokens (1 token ≈ 4 chars)
const OVERLAP_CHARS = 200; // ~50 tokens overlap
const KB_DIR = path.join(process.cwd(), 'scripts', 'knowledge_base');
const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'chunks.json');

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Get all markdown files recursively from a directory
 */
function getMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Split text into paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  // Split on double newlines (paragraph breaks)
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Chunk a document into overlapping pieces
 */
function chunkDocument(
  content: string,
  metadata: DocumentMetadata,
  sourceFile: string,
  category: string
): Chunk[] {
  const chunks: Chunk[] = [];
  const paragraphs = splitIntoParagraphs(content);

  let currentChunk = '';
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];

    // If adding this paragraph would exceed chunk size
    if (currentChunk.length + paragraph.length > CHUNK_SIZE_CHARS && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(createChunk(currentChunk, metadata, sourceFile, category, chunkIndex, 0));
      chunkIndex++;

      // Start new chunk with overlap
      // Take last ~200 characters from previous chunk for context
      const overlapStart = Math.max(0, currentChunk.length - OVERLAP_CHARS);
      currentChunk = currentChunk.slice(overlapStart) + '\n\n' + paragraph;
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  // Add final chunk
  if (currentChunk.length > 0) {
    chunks.push(createChunk(currentChunk, metadata, sourceFile, category, chunkIndex, 0));
  }

  // Update totalChunks for all chunks
  chunks.forEach((chunk) => {
    chunk.metadata.totalChunks = chunks.length;
  });

  return chunks;
}

/**
 * Create a chunk object with metadata
 */
function createChunk(
  content: string,
  docMetadata: DocumentMetadata,
  sourceFile: string,
  category: string,
  chunkIndex: number,
  totalChunks: number
): Chunk {
  const fileName = path.basename(sourceFile, '.md');

  // Normalize critical_question to array
  let criticalQuestions: number[] = [];
  if (docMetadata.critical_question) {
    if (Array.isArray(docMetadata.critical_question)) {
      criticalQuestions = docMetadata.critical_question;
    } else {
      criticalQuestions = [docMetadata.critical_question];
    }
  }

  return {
    chunkId: `${fileName}-chunk-${chunkIndex.toString().padStart(3, '0')}`,
    content: content.trim(),
    metadata: {
      sourceDocument: docMetadata.title || fileName,
      sourceFile: path.relative(KB_DIR, sourceFile),
      category,
      title: docMetadata.title || 'Untitled',
      author: docMetadata.author,
      criticalQuestion: criticalQuestions,
      topics: Array.isArray(docMetadata.topics) ? docMetadata.topics : [],
      documentType: docMetadata.type || docMetadata.document_type || 'unknown',
      chunkIndex,
      totalChunks,
      estimatedTokens: estimateTokens(content),
    },
  };
}

/**
 * Process all documents and generate chunks
 */
async function processDocuments() {
  console.log('📚 Document Chunking Pipeline\n');
  console.log('=' .repeat(50));
  console.log();

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Get all markdown files
  const markdownFiles = getMarkdownFiles(KB_DIR);
  console.log(`📄 Found ${markdownFiles.length} markdown documents\n`);

  const allChunks: Chunk[] = [];
  let processedDocs = 0;
  let skippedDocs = 0;

  // Process each document
  for (const filePath of markdownFiles) {
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const { data: metadata, content } = matter(fileContent);

      // Get category from directory name
      const relativePath = path.relative(KB_DIR, filePath);
      const category = relativePath.split(path.sep)[0] || 'unknown';

      // Skip if document is too short
      if (content.trim().length < 100) {
        console.log(`⏭️  Skipping ${path.basename(filePath)} (too short)`);
        skippedDocs++;
        continue;
      }

      // Chunk the document
      const chunks = chunkDocument(content, metadata as DocumentMetadata, filePath, category);

      allChunks.push(...chunks);
      processedDocs++;

      console.log(
        `✅ ${path.basename(filePath).padEnd(60)} → ${chunks.length.toString().padStart(2)} chunks`
      );
    } catch (error: any) {
      console.error(`❌ Error processing ${path.basename(filePath)}: ${error.message}`);
      skippedDocs++;
    }
  }

  console.log();
  console.log('=' .repeat(50));
  console.log();
  console.log('📊 Chunking Summary:');
  console.log(`   Documents processed: ${processedDocs}`);
  console.log(`   Documents skipped: ${skippedDocs}`);
  console.log(`   Total chunks created: ${allChunks.length}`);
  console.log();

  // Calculate statistics
  const totalTokens = allChunks.reduce((sum, chunk) => sum + chunk.metadata.estimatedTokens, 0);
  const avgTokensPerChunk =
    allChunks.length > 0 ? Math.round(totalTokens / allChunks.length) : 0;

  console.log('📈 Chunk Statistics:');
  console.log(`   Total estimated tokens: ${totalTokens.toLocaleString()}`);
  console.log(`   Average tokens per chunk: ${avgTokensPerChunk}`);
  console.log(`   Min chunk size: ${Math.min(...allChunks.map((c) => c.metadata.estimatedTokens))} tokens`);
  console.log(`   Max chunk size: ${Math.max(...allChunks.map((c) => c.metadata.estimatedTokens))} tokens`);
  console.log();

  // Group by category
  const chunksByCategory: Record<string, number> = {};
  allChunks.forEach((chunk) => {
    chunksByCategory[chunk.metadata.category] =
      (chunksByCategory[chunk.metadata.category] || 0) + 1;
  });

  console.log('📂 Chunks by Category:');
  Object.entries(chunksByCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`   ${category.padEnd(35)} ${count.toString().padStart(3)} chunks`);
    });
  console.log();

  // Group by Critical Question
  const chunksByCQ: Record<string, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    'multiple': 0,
    'none': 0,
  };

  allChunks.forEach((chunk) => {
    const cqs = chunk.metadata.criticalQuestion || [];
    if (cqs.length === 0) {
      chunksByCQ.none++;
    } else if (cqs.length === 1) {
      chunksByCQ[cqs[0].toString()]++;
    } else {
      chunksByCQ.multiple++;
    }
  });

  console.log('❓ Chunks by Critical Question:');
  console.log(`   Question 1: ${chunksByCQ['1'].toString().padStart(3)} chunks`);
  console.log(`   Question 2: ${chunksByCQ['2'].toString().padStart(3)} chunks`);
  console.log(`   Question 3: ${chunksByCQ['3'].toString().padStart(3)} chunks`);
  console.log(`   Question 4: ${chunksByCQ['4'].toString().padStart(3)} chunks`);
  console.log(`   Multiple:   ${chunksByCQ.multiple.toString().padStart(3)} chunks`);
  console.log(`   None:       ${chunksByCQ.none.toString().padStart(3)} chunks`);
  console.log();

  // Save chunks to JSON
  writeFileSync(OUTPUT_FILE, JSON.stringify(allChunks, null, 2));
  console.log(`✅ Chunks saved to: ${OUTPUT_FILE}`);
  console.log();

  // Sample chunks
  console.log('📝 Sample Chunks (first 2):');
  console.log();
  allChunks.slice(0, 2).forEach((chunk, i) => {
    console.log(`Chunk ${i + 1}:`);
    console.log(`  ID: ${chunk.chunkId}`);
    console.log(`  Source: ${chunk.metadata.sourceDocument}`);
    console.log(`  Category: ${chunk.metadata.category}`);
    console.log(`  Critical Questions: ${chunk.metadata.criticalQuestion?.join(', ') || 'none'}`);
    console.log(`  Tokens: ${chunk.metadata.estimatedTokens}`);
    console.log(`  Content preview: ${chunk.content.slice(0, 150)}...`);
    console.log();
  });

  console.log('✅ Document chunking complete!');
  console.log('   You can now proceed to embedding generation (Task 3.3)\n');
}

// Run the script
processDocuments().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
