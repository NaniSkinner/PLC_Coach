"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to recalculate
      textareaRef.current.style.height = "auto";
      // Set to scrollHeight
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  function handleSend() {
    const message = input.trim();
    if (message && !disabled) {
      onSend(message);
      setInput("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const maxLength = 2000;
  const remaining = maxLength - input.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative group">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Message AI PLC Coach..."
            className="w-full resize-none rounded-2xl border-2 border-st-gray-300/50 bg-white/80 backdrop-blur-sm px-5 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-st-purple/50 focus:border-st-purple transition-all duration-300 min-h-[56px] max-h-[200px] disabled:bg-st-gray-100 disabled:cursor-not-allowed shadow-md focus:shadow-xl placeholder:text-st-gray-400"
            rows={1}
            maxLength={maxLength}
          />
          <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-st-purple/5 to-st-purple-light/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur" />
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="group bg-linear-to-r from-st-purple to-st-purple-dark hover:from-st-purple-dark hover:to-st-purple h-[56px] w-[56px] p-0 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 disabled:hover:scale-100"
        >
          <Send className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </div>

      {/* Character counter */}
      <div className="flex justify-between items-center text-xs text-st-gray-500 px-2">
        <p
          className={`font-semibold ${
            remaining < 100 ? "text-red-500" : "text-st-gray-400"
          }`}
        >
          {remaining} / {maxLength}
        </p>
      </div>
    </div>
  );
}
