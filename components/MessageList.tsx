'use client';

import { Message } from '@/types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-st-gray-700">
        <div className="text-center max-w-md px-4">
          <p className="text-lg font-semibold mb-2">Welcome to your PLC Coach</p>
          <p className="text-sm mb-4">
            Ask me anything about implementing PLCs, analyzing data, designing interventions, and more.
          </p>

          {/* Suggested Questions */}
          <div className="mt-6">
            <p className="text-xs font-semibold mb-2 text-st-gray-700">
              Try asking:
            </p>
            <div className="space-y-2 text-xs text-left">
              <div className="bg-st-gray-50 p-2 rounded border border-gray-200">
                "How do we identify essential standards?"
              </div>
              <div className="bg-st-gray-50 p-2 rounded border border-gray-200">
                "What's a data protocol?"
              </div>
              <div className="bg-st-gray-50 p-2 rounded border border-gray-200">
                "How do we schedule intervention time?"
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
