'use client';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-8 animate-message-in-assistant">
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="relative group">
          <div className="absolute -inset-1 bg-st-purple/10 rounded-3xl blur opacity-50" />
          <div className="relative bg-white border border-st-gray-200/50 rounded-3xl rounded-bl-md px-6 py-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-st-gray-700 font-medium">Coach is thinking</span>
              <div className="flex space-x-1.5">
                <div
                  className="w-2.5 h-2.5 bg-gradient-to-r from-st-purple to-st-purple-light rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2.5 h-2.5 bg-gradient-to-r from-st-purple to-st-purple-light rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2.5 h-2.5 bg-gradient-to-r from-st-purple to-st-purple-light rounded-full animate-bounce shadow-sm"
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
