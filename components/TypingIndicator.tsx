'use client';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white border border-gray-300 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-st-gray-700">Coach is thinking</span>
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-st-blue-primary rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-2 h-2 bg-st-blue-primary rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-2 h-2 bg-st-blue-primary rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
