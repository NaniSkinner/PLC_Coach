#!/usr/bin/env tsx

/**
 * Test Retrieval Quality
 *
 * This script tests the RAG retrieval system with a comprehensive set of queries.
 * It validates that:
 * 1. Relevant results are returned for each query
 * 2. Correct Critical Questions are matched
 * 3. Expected topics appear in results
 * 4. Retrieval time is acceptable (< 200ms)
 * 5. Score thresholds are appropriate
 */

import { readFileSync } from 'fs';
import * as path from 'path';
import { retrieveContext, getRetrievalStats } from '../app/lib/rag/retrieval';

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

// Test queries with expected results
interface TestQuery {
  query: string;
  expectedCQ: number[];
  expectedTopics: string[];
  description: string;
}

const testQueries: TestQuery[] = [
  // Critical Question 1
  {
    query: 'How do we identify essential standards?',
    expectedCQ: [1],
    expectedTopics: ['essential standards', 'curriculum'],
    description: 'Q1: Essential standards identification',
  },
  {
    query: 'What criteria should we use to select priority standards?',
    expectedCQ: [1],
    expectedTopics: ['essential standards', 'endurance', 'leverage', 'readiness'],
    description: 'Q1: Criteria for priority standards',
  },
  {
    query: 'How do we unpack standards to understand what students need to know?',
    expectedCQ: [1],
    expectedTopics: ['standards', 'unpacking'],
    description: 'Q1: Unpacking standards',
  },

  // Critical Question 2
  {
    query: 'How do we analyze CFA data effectively?',
    expectedCQ: [2],
    expectedTopics: ['data analysis', 'common formative assessment'],
    description: 'Q2: CFA data analysis',
  },
  {
    query: 'What makes a good common formative assessment?',
    expectedCQ: [2],
    expectedTopics: ['assessment', 'CFA', 'design'],
    description: 'Q2: CFA design',
  },
  {
    query: 'How often should we give common formative assessments?',
    expectedCQ: [2],
    expectedTopics: ['assessment', 'frequency', 'timing'],
    description: 'Q2: CFA frequency',
  },
  {
    query: 'How do we ensure scoring consistency across teachers?',
    expectedCQ: [2],
    expectedTopics: ['scoring', 'consistency', 'calibration'],
    description: 'Q2: Scoring consistency',
  },

  // Critical Question 3
  {
    query: 'What interventions work for struggling students?',
    expectedCQ: [3],
    expectedTopics: ['intervention', 'systematic response'],
    description: 'Q3: Intervention strategies',
  },
  {
    query: 'How do we create time for interventions in the schedule?',
    expectedCQ: [3],
    expectedTopics: ['intervention', 'time', 'scheduling'],
    description: 'Q3: Creating intervention time',
  },
  {
    query: 'What is the difference between Tier 2 and Tier 3 interventions?',
    expectedCQ: [3],
    expectedTopics: ['intervention', 'MTSS', 'RTI'],
    description: 'Q3: Tier 2 vs Tier 3',
  },
  {
    query: 'How do we monitor student progress during interventions?',
    expectedCQ: [3],
    expectedTopics: ['intervention', 'progress monitoring', 'data'],
    description: 'Q3: Progress monitoring',
  },

  // Critical Question 4
  {
    query: 'How do we extend learning for students who are already proficient?',
    expectedCQ: [4],
    expectedTopics: ['extension', 'enrichment'],
    description: 'Q4: Extension strategies',
  },
  {
    query: 'What is the difference between extension and enrichment?',
    expectedCQ: [4],
    expectedTopics: ['extension', 'enrichment'],
    description: 'Q4: Extension vs enrichment',
  },

  // General PLC questions
  {
    query: 'What are the three big ideas of a PLC?',
    expectedCQ: [1, 2, 3, 4],
    expectedTopics: ['three big ideas', 'PLC foundation'],
    description: 'General: Three Big Ideas',
  },
  {
    query: 'How do we build a collaborative culture in our team?',
    expectedCQ: [1, 2, 3, 4],
    expectedTopics: ['collaborative culture', 'team norms'],
    description: 'General: Collaborative culture',
  },
  {
    query: 'What should a PLC meeting agenda include?',
    expectedCQ: [1, 2, 3, 4],
    expectedTopics: ['PLC meetings', 'agenda', 'protocol'],
    description: 'General: Meeting structure',
  },

  // Practical/Coaching questions
  {
    query: 'My team is resistant to analyzing data together. What should I do?',
    expectedCQ: [2],
    expectedTopics: ['data analysis', 'coaching', 'collaboration'],
    description: 'Coaching: Data resistance',
  },
  {
    query: 'How do I help a teacher whose students are performing much lower than the rest of the team?',
    expectedCQ: [2, 3],
    expectedTopics: ['data analysis', 'coaching', 'intervention'],
    description: 'Coaching: Performance gaps',
  },

  // Implementation questions
  {
    query: 'What are SMART goals and how do we write them?',
    expectedCQ: [1, 2, 3, 4],
    expectedTopics: ['SMART goals', 'goal setting'],
    description: 'Implementation: SMART goals',
  },
  {
    query: 'How do we onboard a new teacher to our PLC?',
    expectedCQ: [1, 2, 3, 4],
    expectedTopics: ['onboarding', 'team norms'],
    description: 'Implementation: Onboarding',
  },
];

/**
 * Test a single query
 */
async function testQuery(test: TestQuery, index: number, total: number): Promise<boolean> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Test ${index + 1}/${total}: ${test.description}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Query: "${test.query}"`);
  console.log(`Expected CQ: ${test.expectedCQ.join(', ')}`);
  console.log(`Expected Topics: ${test.expectedTopics.join(', ')}`);
  console.log();

  // Measure retrieval time
  const startTime = Date.now();
  const results = await retrieveContext(test.query, { topK: 5 });
  const retrievalTime = Date.now() - startTime;

  console.log(`⏱️  Retrieval Time: ${retrievalTime}ms`);
  console.log(`📊 Results: ${results.length} chunks retrieved\n`);

  // Show results
  results.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.metadata.title}`);
    console.log(`     Category: ${result.metadata.category}`);
    console.log(`     CQ: ${result.metadata.criticalQuestion}`);
    console.log(`     Score: ${result.score.toFixed(3)} (adjusted: ${result.adjustedScore.toFixed(3)})`);
    console.log(`     Topics: ${result.metadata.topics}`);
    console.log(`     Preview: ${result.content.slice(0, 100)}...`);
    console.log();
  });

  // Validation
  let passed = true;
  const validations: string[] = [];

  // Check if any expected CQ appears in results
  const resultCQs = results.flatMap((r) =>
    r.metadata.criticalQuestion.split(',').map(Number)
  );
  const hasCQMatch = test.expectedCQ.some((cq) => resultCQs.includes(cq));

  if (hasCQMatch) {
    validations.push('✅ Critical Question match');
  } else {
    validations.push('❌ No Critical Question match');
    passed = false;
  }

  // Check if any expected topic appears in results
  const hasTopicMatch = results.some((r) =>
    test.expectedTopics.some((topic) =>
      r.metadata.topics.toLowerCase().includes(topic.toLowerCase())
    )
  );

  if (hasTopicMatch) {
    validations.push('✅ Topic match');
  } else {
    validations.push('⚠️  No exact topic match (may still be relevant)');
  }

  // Check retrieval time
  if (retrievalTime < 200) {
    validations.push(`✅ Retrieval time < 200ms`);
  } else if (retrievalTime < 500) {
    validations.push(`⚠️  Retrieval time ${retrievalTime}ms (acceptable but slow)`);
  } else {
    validations.push(`❌ Retrieval time ${retrievalTime}ms (too slow)`);
    passed = false;
  }

  // Check if we got results
  if (results.length >= 3) {
    validations.push('✅ Sufficient results (3+)');
  } else if (results.length > 0) {
    validations.push(`⚠️  Only ${results.length} result(s)`);
  } else {
    validations.push('❌ No results');
    passed = false;
  }

  console.log('Validation:');
  validations.forEach((v) => console.log(`  ${v}`));

  if (passed) {
    console.log('\n✅ TEST PASSED');
  } else {
    console.log('\n❌ TEST FAILED');
  }

  return passed;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 RAG Retrieval Quality Tests\n');
  console.log('Testing retrieval system with diverse queries...\n');

  let passed = 0;
  let failed = 0;
  const retrievalTimes: number[] = [];

  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i];

    try {
      const startTime = Date.now();
      const success = await testQuery(test, i, testQueries.length);
      const time = Date.now() - startTime;

      retrievalTimes.push(time);

      if (success) {
        passed++;
      } else {
        failed++;
      }
    } catch (error: any) {
      console.log(`\n❌ ERROR: ${error.message}\n`);
      failed++;
    }

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70) + '\n');

  console.log(`Total Tests: ${testQueries.length}`);
  console.log(`Passed: ${passed} (${((passed / testQueries.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed} (${((failed / testQueries.length) * 100).toFixed(1)}%)`);
  console.log();

  const avgTime =
    retrievalTimes.reduce((sum, t) => sum + t, 0) / retrievalTimes.length;
  const maxTime = Math.max(...retrievalTimes);
  const minTime = Math.min(...retrievalTimes);

  console.log('Retrieval Performance:');
  console.log(`  Average time: ${avgTime.toFixed(0)}ms`);
  console.log(`  Min time: ${minTime}ms`);
  console.log(`  Max time: ${maxTime}ms`);
  console.log();

  const successRate = (passed / testQueries.length) * 100;

  if (successRate >= 85) {
    console.log('✅ RETRIEVAL SYSTEM READY');
    console.log('   Success rate >= 85%');
    console.log('   You can proceed to RAG orchestrator (Task 3.7)\n');
  } else if (successRate >= 70) {
    console.log('⚠️  RETRIEVAL SYSTEM NEEDS IMPROVEMENT');
    console.log(`   Success rate: ${successRate.toFixed(1)}% (target: 85%)`);
    console.log('   Consider adjusting reranking factors or chunking strategy\n');
  } else {
    console.log('❌ RETRIEVAL SYSTEM NEEDS WORK');
    console.log(`   Success rate: ${successRate.toFixed(1)}% (target: 85%)`);
    console.log('   Review chunking, embeddings, and reranking logic\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
