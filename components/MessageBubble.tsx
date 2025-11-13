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
      <div className="flex justify-end mb-8 animate-message-in-user">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-st-purple to-st-purple-light rounded-3xl opacity-20 group-hover:opacity-30 blur transition duration-300" />
            <div className="relative bg-linear-to-r from-st-purple to-st-purple-dark text-white rounded-3xl rounded-br-md px-6 py-4 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                {message.content}
              </p>
            </div>
          </div>
          <p className="text-xs text-st-gray-500 mt-2.5 text-right font-medium">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  }

  // Assistant message styling
  return (
    <div className="flex justify-start mb-8 animate-message-in-assistant">
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="relative group">
          <div className="absolute -inset-1 bg-st-purple/5 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative bg-white border border-st-gray-200/50 rounded-3xl rounded-bl-md px-6 py-4 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-st-purple/20">
            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-st-gray-900">
                {message.content}
              </p>
            </div>

            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-st-gray-200/50">
                <p className="text-xs text-st-gray-700 font-bold mb-3 uppercase tracking-wide">
                  Sources
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.citations.map((citation) => (
                    <CitationPill key={citation.id} citation={citation} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-st-gray-500 mt-2.5 font-medium">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
