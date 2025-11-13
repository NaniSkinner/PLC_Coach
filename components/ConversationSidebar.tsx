'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, Menu, X } from 'lucide-react';

interface Conversation {
  sessionId: string;
  userId: string;
  summary?: string;
  createdAt: string;
  lastActiveAt: string;
  messageCount: number;
}

interface ConversationSidebarProps {
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewConversation: () => void;
}

export default function ConversationSidebar({
  currentSessionId,
  onSelectSession,
  onNewConversation,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [currentSessionId]);

  async function loadConversations() {
    try {
      const response = await fetch('/api/sessions?userId=demo-user');
      const data = await response.json();
      setConversations(data.sessions || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();

    if (!confirm('Delete this conversation?')) return;

    try {
      await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });

      // If deleting current session, create new one
      if (sessionId === currentSessionId) {
        onNewConversation();
      }

      // Reload conversations
      loadConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }

  function getConversationTitle(conv: Conversation): string {
    if (conv.summary) return conv.summary;
    if (conv.messageCount === 0) return 'New conversation';

    const date = new Date(conv.lastActiveAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full backdrop-blur-xl bg-white/95 border-r border-st-gray-200/50 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-st-gray-200/50">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-st-purple to-st-purple-light">
          AI PLC Coach
        </h1>
        <p className="text-xs text-st-gray-600 font-medium mt-1 mb-4">
          Professional Learning Communities guidance
        </p>
        <button
          onClick={() => {
            onNewConversation();
            setIsMobileOpen(false);
          }}
          className="group w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-st-purple to-st-purple-dark hover:from-st-purple-dark hover:to-st-purple text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          <span className="text-sm font-bold">New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin w-6 h-6 border-3 border-st-purple/30 border-t-st-purple rounded-full mx-auto" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-st-gray-400 mx-auto mb-2" />
            <p className="text-xs text-st-gray-500 font-medium">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv, index) => (
            <div
              key={conv.sessionId}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 cursor-pointer animate-fade-in ${
                conv.sessionId === currentSessionId
                  ? 'bg-gradient-to-r from-st-purple/15 to-st-purple-light/15 border border-st-purple/30 shadow-md scale-[1.02]'
                  : 'hover:bg-st-gray-100/80 hover:scale-[1.01] border border-transparent'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => {
                onSelectSession(conv.sessionId);
                setIsMobileOpen(false);
              }}
            >
              <div className="relative">
                <div className={`w-9 h-9 rounded-xl ${
                  conv.sessionId === currentSessionId
                    ? 'bg-gradient-to-br from-st-purple to-st-purple-dark shadow-lg'
                    : 'bg-gradient-to-br from-st-purple/80 to-st-purple-dark/80'
                } flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-all duration-300 group-hover:scale-110`}>
                  {conv.userId.substring(0, 2).toUpperCase()}
                </div>
                {conv.sessionId === currentSessionId && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-st-purple-light rounded-full border-2 border-white shadow-sm animate-pulse" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm font-medium truncate ${
                  conv.sessionId === currentSessionId ? 'text-st-gray-900' : 'text-st-gray-700'
                }`}>
                  {getConversationTitle(conv)}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(conv.sessionId, e)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all duration-200 text-st-gray-600 hover:text-red-600 active:scale-90"
                aria-label="Delete conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-st-gray-200/50 backdrop-blur-sm">
        <p className="text-xs text-st-gray-500 text-center font-semibold tracking-wide">
          AI PLC Coach
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white text-st-gray-900 rounded-xl shadow-lg hover:bg-st-gray-50 transition-all border border-st-gray-200"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-64 z-50">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
