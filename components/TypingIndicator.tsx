'use client';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-8 animate-message-in-assistant">
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="relative group">
          <div className="absolute -inset-1 bg-st-teal/10 rounded-3xl blur opacity-50" />
          <div className="relative bg-white border-2 border-st-teal/30 rounded-3xl rounded-bl-md px-6 py-4 shadow-lg overflow-hidden">
            {/* AI Shimmer effect */}
            <div className="absolute inset-0 animate-ai-shimmer" />
            <div className="relative flex items-center space-x-3">
              <span className="text-sm text-st-gray-700 font-medium">Coach is thinking</span>
              <div className="flex space-x-1.5">
                <div
                  className="w-2.5 h-2.5 bg-gradient-to-r from-st-teal to-st-teal-light rounded-full animate-typing-bounce shadow-sm"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2.5 h-2.5 bg-gradient-to-r from-st-teal to-st-teal-light rounded-full animate-typing-bounce shadow-sm"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2.5 h-2.5 bg-gradient-to-r from-st-teal to-st-teal-light rounded-full animate-typing-bounce shadow-sm"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
