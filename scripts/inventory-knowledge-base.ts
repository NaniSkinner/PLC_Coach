import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

interface DocumentStats {
  totalDocuments: number;
  byCategory: Record<string, number>;
  byCriticalQuestion: Record<string, number>;
  byType: Record<string, number>;
  totalWords: number;
  estimatedChunks: number;
  missingMetadata: string[];
}

const KB_PATH = path.join(__dirname, 'knowledge_base');

async function inventoryKnowledgeBase(): Promise<DocumentStats> {
  const stats: DocumentStats = {
    totalDocuments: 0,
    byCategory: {},
    byCriticalQuestion: {},
    byType: {},
    totalWords: 0,
    estimatedChunks: 0,
    missingMetadata: [],
  };

  const categories = fs.readdirSync(KB_PATH).filter(f =>
    fs.statSync(path.join(KB_PATH, f)).isDirectory()
  );

  for (const category of categories) {
    const categoryPath = path.join(KB_PATH, category);
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));

    stats.byCategory[category] = files.length;

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(content);

      stats.totalDocuments++;

      // Count words
      const wordCount = parsed.content.split(/\s+/).length;
      stats.totalWords += wordCount;

      // Track document type
      const docType = parsed.data.type || 'unknown';
      stats.byType[docType] = (stats.byType[docType] || 0) + 1;

      // Track critical question
      const cq = parsed.data.critical_question;
      if (cq) {
        const cqKey = Array.isArray(cq) ? cq.join(',') : cq.toString();
        stats.byCriticalQuestion[cqKey] = (stats.byCriticalQuestion[cqKey] || 0) + 1;
      }

      // Check for missing metadata
      if (!parsed.data.title || !parsed.data.type || !parsed.data.topics) {
        stats.missingMetadata.push(`${category}/${file}`);
      }
    }
  }

  // Estimate chunks (assuming 400-600 words per chunk)
  stats.estimatedChunks = Math.floor(stats.totalWords / 500);

  return stats;
}

async function main() {
  console.log('📊 Knowledge Base Inventory\n');
  console.log('Scanning knowledge base...\n');

  const stats = await inventoryKnowledgeBase();

  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Documents: ${stats.totalDocuments}`);
  console.log(`Total Words: ${stats.totalWords.toLocaleString()}`);
  console.log(`Estimated Chunks: ${stats.estimatedChunks}`);
  console.log();

  console.log('By Category:');
  Object.entries(stats.byCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} documents`);
  });
  console.log();

  console.log('By Document Type:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} documents`);
  });
  console.log();

  console.log('By Critical Question:');
  Object.entries(stats.byCriticalQuestion).forEach(([cq, count]) => {
    console.log(`  Q${cq}: ${count} documents`);
  });
  console.log();

  if (stats.missingMetadata.length > 0) {
    console.log('⚠️  Documents Missing Metadata:');
    stats.missingMetadata.forEach(doc => console.log(`  - ${doc}`));
    console.log();
  }

  // Save report
  const reportPath = path.join(__dirname, 'knowledge_base_inventory.json');
  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
  console.log(`✅ Report saved to: ${reportPath}`);

  // Check if Phase 2 goals are met
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 2 COMPLETION STATUS');
  console.log('='.repeat(60));
  console.log(`Documents (target: 50+): ${stats.totalDocuments >= 50 ? '✅' : '❌'} ${stats.totalDocuments}/50`);
  console.log(`Word Count (target: 150K+): ${stats.totalWords >= 150000 ? '✅' : '❌'} ${stats.totalWords.toLocaleString()}/150,000`);
  console.log(`Chunks (target: 400+): ${stats.estimatedChunks >= 400 ? '✅' : '❌'} ${stats.estimatedChunks}/400`);
  console.log(`Missing Metadata: ${stats.missingMetadata.length === 0 ? '✅' : '❌'} ${stats.missingMetadata.length} issues`);
}

main().catch(console.error);
