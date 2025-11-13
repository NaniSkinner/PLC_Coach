'use client';

import { useEffect, useState } from 'react';
import ChatContainer from '@/components/ChatContainer';
import ConversationSidebar from '@/components/ConversationSidebar';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initSession() {
      try {
        // Check for existing session in localStorage
        let existingSessionId = localStorage.getItem('plc-session-id');

        if (!existingSessionId) {
          // Create new session
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'demo-user' }),
          });

          if (!response.ok) {
            throw new Error('Failed to create session');
          }

          const data = await response.json();
          existingSessionId = data.sessionId;

          // Store in localStorage
          localStorage.setItem('plc-session-id', existingSessionId);
        }

        setSessionId(existingSessionId);
      } catch (err) {
        console.error('Session initialization error:', err);
        setError('Failed to initialize chat session');
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  async function handleSelectSession(newSessionId: string) {
    // Update localStorage and state
    localStorage.setItem('plc-session-id', newSessionId);
    setSessionId(newSessionId);
  }

  async function handleNewConversation() {
    try {
      // Create new session
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      const newSessionId = data.sessionId;

      // Update localStorage and state
      localStorage.setItem('plc-session-id', newSessionId);
      setSessionId(newSessionId);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
      setError('Failed to create new conversation');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-st-purple/5 via-white to-st-purple/5">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-st-purple/20 border-t-st-purple rounded-full mx-auto mb-4" />
          <p className="text-st-gray-700 font-medium">Initializing coach...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-st-purple/5 via-white to-st-purple/5">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-red-200">
          <p className="text-red-600 mb-4">{error || 'Failed to start session'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-st-purple hover:bg-st-purple-dark text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-st-purple/5 via-white to-st-purple/5">
      <ConversationSidebar
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewConversation={handleNewConversation}
      />
      <ChatContainer sessionId={sessionId} key={sessionId} />
    </div>
  );
}
