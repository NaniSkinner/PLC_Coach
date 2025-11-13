"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { Message, ChatResponse } from "@/types";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

interface ChatContainerProps {
  sessionId: string;
}

export default function ChatContainer({ sessionId }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing conversation
  useEffect(() => {
    async function loadConversation() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        const data = await response.json();

        if (data.messages) {
          setMessages(
            data.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              citations: msg.citations || [],
              metadata: msg.metadata || {},
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
        setError("Failed to load conversation history");
      }
    }

    loadConversation();
  }, [sessionId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSendMessage(content: string) {
    if (!content.trim()) return;

    // Add user message optimistically
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: ChatResponse = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: data.messageId,
        role: "assistant",
        content: data.content,
        timestamp: new Date(data.timestamp),
        citations: data.citations,
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Send message error:", err);
      setError("Failed to send message. Please try again.");
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen flex-1 relative">
      {/* Messages Area with proper spacing */}
      <div className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth">
        {error && (
          <div className="max-w-3xl mx-auto mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm shadow-md">
              {error}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-st-purple/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 bg-linear-to-br from-st-purple to-st-purple-light rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <MessageSquare
                    className="w-10 h-10 text-white"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-st-gray-900 mb-4 font-heading">
                How can I help you today?
              </h2>
              <p className="text-base text-st-gray-600 max-w-md leading-relaxed">
                Ask me anything about Professional Learning Communities,
                essential standards, CFAs, interventions, or enrichment
                strategies.
              </p>
            </div>
          ) : (
            <MessageList messages={messages} />
          )}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Input Area with elevation */}
      <div className="sticky bottom-0 z-40 backdrop-blur-xl bg-white/80 border-t border-st-gray-200/50 px-4 py-6 shadow-2xl">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
