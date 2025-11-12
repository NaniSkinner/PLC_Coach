#!/usr/bin/env tsx

/**
 * End-to-End API Test
 *
 * This script tests the complete API flow:
 * 1. Create a session
 * 2. Send chat messages
 * 3. Retrieve session with messages
 * 4. Test error handling
 */

const API_BASE = 'http://localhost:3000';

interface ChatResponse {
  messageId: string;
  role: 'assistant';
  content: string;
  citations: any[];
  metadata: {
    modelUsed: string;
    responseTime: number;
    retrievedChunks: number;
  };
  timestamp: string;
}

async function testCompleteFlow() {
  console.log('🧪 End-to-End API Test\n');
  console.log('='.repeat(70));
  console.log();

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // ========================================================================
    // Test 1: Create Session
    // ========================================================================
    console.log('Test 1: Creating session...');

    const sessionResponse = await fetch(`${API_BASE}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test-user-e2e' }),
    });

    if (!sessionResponse.ok) {
      throw new Error(`Session creation failed: ${sessionResponse.status}`);
    }

    const session = await sessionResponse.json();
    const sessionId = session.sessionId;

    console.log(`   ✅ Session created: ${sessionId}`);
    console.log(`   User ID: ${session.userId}`);
    console.log();
    testsPassed++;

    // ========================================================================
    // Test 2: Send First Message
    // ========================================================================
    console.log('Test 2: Sending first chat message...');

    const message1 = 'How do we identify essential standards?';
    const startTime1 = Date.now();

    const chatResponse1 = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        message: message1,
      }),
    });

    if (!chatResponse1.ok) {
      throw new Error(`Chat request failed: ${chatResponse1.status}`);
    }

    const response1: ChatResponse = await chatResponse1.json();
    const elapsed1 = Date.now() - startTime1;

    console.log(`   ✅ Response received`);
    console.log(`   Response time: ${elapsed1}ms`);
    console.log(`   Content length: ${response1.content.length} chars`);
    console.log(`   Citations: ${response1.citations.length}`);
    console.log(`   Retrieved chunks: ${response1.metadata.retrievedChunks}`);
    console.log(`   Model: ${response1.metadata.modelUsed}`);
    console.log();
    testsPassed++;

    // ========================================================================
    // Test 3: Send Follow-up Message
    // ========================================================================
    console.log('Test 3: Sending follow-up message...');

    const message2 = 'Can you give me an example for 5th grade math?';
    const startTime2 = Date.now();

    const chatResponse2 = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        message: message2,
      }),
    });

    if (!chatResponse2.ok) {
      throw new Error(`Follow-up chat request failed: ${chatResponse2.status}`);
    }

    const response2: ChatResponse = await chatResponse2.json();
    const elapsed2 = Date.now() - startTime2;

    console.log(`   ✅ Follow-up response received`);
    console.log(`   Response time: ${elapsed2}ms`);
    console.log(`   Content length: ${response2.content.length} chars`);
    console.log();
    testsPassed++;

    // ========================================================================
    // Test 4: Retrieve Session with Messages
    // ========================================================================
    console.log('Test 4: Retrieving full session...');

    const sessionDetailResponse = await fetch(`${API_BASE}/api/sessions/${sessionId}`);

    if (!sessionDetailResponse.ok) {
      throw new Error(`Session retrieval failed: ${sessionDetailResponse.status}`);
    }

    const sessionData = await sessionDetailResponse.json();

    console.log(`   ✅ Session retrieved`);
    console.log(`   Total messages: ${sessionData.messages.length}`);
    console.log(`   Expected: 4 (2 user + 2 assistant)`);

    if (sessionData.messages.length === 4) {
      console.log(`   ✅ Message count correct`);
      testsPassed++;
    } else {
      console.log(`   ❌ Message count mismatch`);
      testsFailed++;
    }
    console.log();

    // ========================================================================
    // Test 5: List User Sessions
    // ========================================================================
    console.log('Test 5: Listing user sessions...');

    const sessionsListResponse = await fetch(`${API_BASE}/api/sessions?userId=test-user-e2e`);

    if (!sessionsListResponse.ok) {
      throw new Error(`Sessions list failed: ${sessionsListResponse.status}`);
    }

    const sessionsList = await sessionsListResponse.json();

    console.log(`   ✅ Sessions list retrieved`);
    console.log(`   Sessions found: ${sessionsList.sessions.length}`);
    testsPassed++;
    console.log();

    // ========================================================================
    // Test 6: Error Handling - Invalid Session
    // ========================================================================
    console.log('Test 6: Testing error handling (invalid session)...');

    const invalidChatResponse = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'nonexistent-session-id',
        message: 'Test message',
      }),
    });

    if (invalidChatResponse.status === 404 || invalidChatResponse.status === 500) {
      console.log(`   ✅ Correctly returned error status: ${invalidChatResponse.status}`);
      testsPassed++;
    } else {
      console.log(`   ❌ Expected error status, got: ${invalidChatResponse.status}`);
      testsFailed++;
    }
    console.log();

    // ========================================================================
    // Test 7: Error Handling - Missing Message
    // ========================================================================
    console.log('Test 7: Testing error handling (missing message)...');

    const missingMessageResponse = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
      }),
    });

    if (missingMessageResponse.status === 400) {
      console.log(`   ✅ Correctly returned 400 Bad Request`);
      testsPassed++;
    } else {
      console.log(`   ❌ Expected 400, got: ${missingMessageResponse.status}`);
      testsFailed++;
    }
    console.log();

    // ========================================================================
    // Test 8: Multiple Query Types
    // ========================================================================
    console.log('Test 8: Testing diverse query types...');

    const diverseQueries = [
      'What interventions work for struggling students?',
      'How do we build collaborative culture?',
      'What are the Three Big Ideas?',
    ];

    for (let i = 0; i < diverseQueries.length; i++) {
      const query = diverseQueries[i];
      const startTime = Date.now();

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          message: query,
        }),
      });

      if (!response.ok) {
        console.log(`   ❌ Query ${i + 1} failed`);
        testsFailed++;
        continue;
      }

      const data: ChatResponse = await response.json();
      const elapsed = Date.now() - startTime;

      console.log(`   ✅ Query ${i + 1}: ${elapsed}ms, ${data.citations.length} citations`);
    }
    testsPassed++;
    console.log();

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('='.repeat(70));
    console.log('TEST SUMMARY\n');
    console.log(`Total Tests: ${testsPassed + testsFailed}`);
    console.log(`Passed: ${testsPassed} ✅`);
    console.log(`Failed: ${testsFailed} ❌`);
    console.log();

    if (testsFailed === 0) {
      console.log('✅ ALL TESTS PASSED');
      console.log('   Backend API is working correctly!');
      console.log('   Ready for Phase 5: Frontend UI\n');
      process.exit(0);
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('   Review errors above\n');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:');
    console.error(error.message);
    console.error();
    process.exit(1);
  }
}

// Run tests
console.log('Starting E2E API tests...');
console.log('Make sure dev server is running: bun dev\n');

testCompleteFlow();
