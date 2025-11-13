'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, PanelLeftClose } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

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
  children: React.ReactNode;
}

function SidebarHeaderContent({
  onNewConversation,
}: {
  onNewConversation: () => void;
}) {
  const { toggleSidebar, state } = useSidebar();

  return (
    <SidebarHeader className="border-b border-st-gray-200/50 p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-st-blue to-st-teal group-data-[collapsible=icon]:hidden">
            AI PLC Coach
          </h1>
          <p className="text-xs text-st-gray-600 font-medium mt-1 group-data-[collapsible=icon]:hidden">
            Professional Learning Communities guidance
          </p>
        </div>
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-st-gray-600 hover:text-st-blue hover:bg-st-blue/10"
          title={state === "collapsed" ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"}
        >
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      </div>
      <Button
        onClick={onNewConversation}
        className="w-full bg-gradient-to-r from-st-orange to-st-orange-dark hover:from-st-orange-dark hover:to-st-orange text-white shadow-lg hover:shadow-xl transition-all group-data-[collapsible=icon]:hidden"
      >
        <Plus className="w-5 h-5 mr-2" />
        New Chat
      </Button>
    </SidebarHeader>
  );
}

export default function ConversationSidebar({
  currentSessionId,
  onSelectSession,
  onNewConversation,
  children,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-gradient-to-br from-st-teal/5 via-white to-st-blue/5">
        <Sidebar collapsible="icon" className="border-r border-st-gray-200/50" variant="sidebar">
          <SidebarHeaderContent onNewConversation={onNewConversation} />

          <SidebarContent className="px-2 py-2">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-3 border-st-blue/30 border-t-st-blue rounded-full mx-auto" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-st-gray-400 mx-auto mb-2" />
                <p className="text-xs text-st-gray-500 font-medium">No conversations yet</p>
              </div>
            ) : (
              <SidebarMenu>
                {conversations.map((conv) => (
                  <SidebarMenuItem key={conv.sessionId}>
                    <SidebarMenuButton
                      onClick={() => onSelectSession(conv.sessionId)}
                      isActive={conv.sessionId === currentSessionId}
                      tooltip={getConversationTitle(conv)}
                      className="group-data-[collapsible=icon]:hidden"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${
                          conv.sessionId === currentSessionId
                            ? 'bg-gradient-to-br from-st-blue to-st-teal shadow-lg'
                            : 'bg-gradient-to-br from-st-blue/80 to-st-teal/80'
                        } flex items-center justify-center text-white text-xs font-bold shrink-0`}
                      >
                        {conv.userId.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate text-sm font-medium">
                        {getConversationTitle(conv)}
                      </span>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      onClick={(e) => handleDelete(conv.sessionId, e)}
                      showOnHover
                      className="text-st-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-st-gray-200/50 p-4">
            <p className="text-xs text-st-gray-500 text-center font-semibold tracking-wide group-data-[collapsible=icon]:hidden">
              AI PLC Coach
            </p>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
