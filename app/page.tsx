'use client';

import { useEffect, useState } from 'react';
import ChatContainer from '@/components/ChatContainer';

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-st-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-st-blue-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-st-gray-700">Initializing coach...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionId) {
    return (
      <div className="flex items-center justify-center h-screen bg-st-gray-50">
        <div className="text-center text-red-600">
          <p>{error || 'Failed to start session'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-st-blue-primary text-white rounded hover:bg-st-blue-secondary transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <ChatContainer sessionId={sessionId} />;
}
