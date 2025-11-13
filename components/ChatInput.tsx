'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to recalculate
      textareaRef.current.style.height = 'auto';
      // Set to scrollHeight
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  function handleSend() {
    const message = input.trim();
    if (message && !disabled) {
      onSend(message);
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const maxLength = 2000;
  const remaining = maxLength - input.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about PLCs, data analysis, interventions..."
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-st-blue-primary min-h-[48px] max-h-[200px] disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={1}
          maxLength={maxLength}
        />

        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="bg-st-blue-primary hover:bg-st-blue-secondary h-12 px-4"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Character counter */}
      <div className="flex justify-between items-center text-xs text-st-gray-700">
        <p>
          Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift + Enter</kbd> for new line
        </p>
        <p className={remaining < 100 ? 'text-st-orange' : ''}>
          {remaining} characters remaining
        </p>
      </div>
    </div>
  );
}
