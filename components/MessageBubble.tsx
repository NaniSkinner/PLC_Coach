'use client';

import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import CitationPill from './CitationPill';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // User message styling
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[95%] sm:max-w-[80%]">
          <div className="bg-st-blue-primary text-white rounded-2xl rounded-br-sm px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <p className="text-xs text-st-gray-700 mt-1 text-right">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  }

  // Assistant message styling
  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] sm:max-w-[80%]">
        <div className="bg-white border border-gray-300 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-st-gray-900">
              {message.content}
            </p>
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-st-gray-700 mb-2 font-semibold">
                Sources:
              </p>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((citation) => (
                  <CitationPill key={citation.id} citation={citation} />
                ))}
              </div>
            </div>
          )}

          {/* Metadata (optional - for debugging) */}
          {message.metadata?.responseTime && (
            <p className="text-xs text-gray-400 mt-2">
              Response time: {message.metadata.responseTime}ms
            </p>
          )}
        </div>

        <p className="text-xs text-st-gray-700 mt-1">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
