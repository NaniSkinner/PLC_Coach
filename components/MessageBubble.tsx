'use client';

import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import CitationPill from './CitationPill';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // User message styling - Light gray background per Brand.md
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-8 animate-message-in-user">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-st-blue to-st-blue-light rounded-3xl opacity-10 group-hover:opacity-20 blur transition duration-300" />
            <div className="relative bg-[#F6F7FB] dark:bg-st-gray-200 text-st-gray-900 rounded-3xl rounded-br-md px-6 py-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
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

  // Assistant message styling - White background with teal border per Brand.md
  return (
    <div className="flex justify-start mb-8 animate-message-in-assistant">
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="relative group">
          <div className="absolute -inset-1 bg-st-teal/5 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative bg-white dark:bg-card border-2 border-st-teal/30 rounded-3xl rounded-bl-md px-6 py-4 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-st-teal/50">
            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-st-gray-900">
                {message.content}
              </p>
            </div>

            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-st-teal/20">
                <p className="text-xs text-st-teal-dark font-bold mb-3 uppercase tracking-wide">
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
