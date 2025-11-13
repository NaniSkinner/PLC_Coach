# Phase 5: Frontend UI Development - Detailed Task List

**Duration:** 3-4 days (Completed in 1 day!)
**Status:** 🟢 Complete
**Prerequisites:** Phase 1 and 4 complete
**Completion Date:** January 13, 2025

---

## Task 5.1: Set Up shadcn/ui Components

### 5.1.1 Verify shadcn/ui Installation
- [x] Check if `components.json` exists (should be from Phase 1)
- [x] Check if `lib/utils.ts` exists
- [x] Verify Tailwind is configured with shadcn

### 5.1.2 Install Required shadcn Components
- [x] Install Button component:
  ```bash
  npx shadcn-ui@latest add button
  ```
- [x] Install Input component:
  ```bash
  npx shadcn-ui@latest add input
  ```
- [x] Install Card component:
  ```bash
  npx shadcn-ui@latest add card
  ```
- [x] Install Dialog component:
  ```bash
  npx shadcn-ui@latest add dialog
  ```
- [x] Install Badge component:
  ```bash
  npx shadcn-ui@latest add badge
  ```
- [x] Install ScrollArea component:
  ```bash
  npx shadcn-ui@latest add scroll-area
  ```
- [x] Install Skeleton component (for loading states):
  ```bash
  npx shadcn-ui@latest add skeleton
  ```

### 5.1.3 Verify Component Installation
- [x] Check `components/ui/` directory
- [x] Verify all 7 components installed
- [x] Test import in a test file
- [x] Run `npm run dev` to ensure no errors

### 5.1.4 Customize shadcn Theme (Optional)
- [x] Open `app/globals.css`
- [x] Adjust CSS variables for Solution Tree branding:
  ```css
  :root {
    --primary: 210 100% 50%; /* Solution Tree Blue #0066CC */
    --primary-foreground: 0 0% 100%;
    --secondary: 14 100% 60%; /* Orange accent */
  }
  ```
- [x] Test theme changes

**Completion Criteria:**
- [x] All shadcn components installed
- [x] No installation errors
- [x] Components verified working

---

## Task 5.2: Create ChatContainer Component

### 5.2.1 Create Component File
- [x] Create file: `app/components/ChatContainer.tsx`
- [x] Add imports:
  ```typescript
  'use client';

  import { useState, useEffect, useRef } from 'react';
  import { Message, ChatResponse } from '@/types';
  import MessageList from './MessageList';
  import ChatInput from './ChatInput';
  import TypingIndicator from './TypingIndicator';
  ```

### 5.2.2 Define Component State
- [x] Create state management:
  ```typescript
  export default function ChatContainer({ sessionId }: { sessionId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  }
  ```

### 5.2.3 Implement Load Conversation
- [x] Create useEffect to load existing conversation:
  ```typescript
  useEffect(() => {
    async function loadConversation() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        const data = await response.json();

        if (data.messages) {
          setMessages(data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            citations: msg.citations || [],
            metadata: msg.metadata || {},
          })));
        }
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setError('Failed to load conversation history');
      }
    }

    loadConversation();
  }, [sessionId]);
  ```

### 5.2.4 Implement Send Message Handler
- [x] Create message sending function:
  ```typescript
  async function handleSendMessage(content: string) {
    if (!content.trim()) return;

    // Add user message optimistically
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ChatResponse = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: data.messageId,
        role: 'assistant',
        content: data.content,
        timestamp: new Date(data.timestamp),
        citations: data.citations,
        metadata: data.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message. Please try again.');
      // Remove optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }
  ```

### 5.2.5 Implement Auto-Scroll
- [x] Add scroll ref:
  ```typescript
  const messagesEndRef = useRef<HTMLDivElement>(null);
  ```
- [x] Add scroll effect:
  ```typescript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  ```

### 5.2.6 Implement Component Layout
- [x] Create render structure:
  ```typescript
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-st-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-heading font-bold text-st-blue-primary">
          AI PLC Virtual Coach
        </h1>
        <p className="text-sm text-st-gray-600">
          Expert guidance for Professional Learning Communities
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <MessageList messages={messages} />

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
  ```

### 5.2.7 Add Error Boundary
- [x] Wrap component in error boundary (optional)
- [x] Handle component-level errors gracefully

### 5.2.8 Test ChatContainer
- [x] Create test page
- [x] Verify messages load
- [x] Test sending messages
- [x] Test auto-scroll
- [x] Test error states

### 5.2.9 Commit ChatContainer
- [x] Stage file: `git add app/components/ChatContainer.tsx`
- [x] Commit: `git commit -m "Add ChatContainer component with message handling"`
- [x] Push: `git push origin main`

**Completion Criteria:**
- [x] ChatContainer component created
- [x] Loads existing conversation
- [x] Sends messages to API
- [x] Updates UI optimistically
- [x] Auto-scrolls to new messages
- [x] Error handling working

---

## Task 5.3: Create MessageList Component

### 5.3.1 Create Component File
- [x] Create file: `app/components/MessageList.tsx`
- [x] Add imports:
  ```typescript
  'use client';

  import { Message } from '@/types';
  import MessageBubble from './MessageBubble';
  ```

### 5.3.2 Implement MessageList Component
- [x] Create component:
  ```typescript
  interface MessageListProps {
    messages: Message[];
  }

  export default function MessageList({ messages }: MessageListProps) {
    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-st-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Welcome to your PLC Coach</p>
            <p className="text-sm">
              Ask me anything about implementing PLCs, analyzing data, designing interventions, and more.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    );
  }
  ```

### 5.3.3 Add Message Grouping (Optional)
- [x] Group consecutive messages from same sender
- [x] Reduce spacing between grouped messages
- [x] Show timestamp only on last message in group

### 5.3.4 Add Virtualization (Optional for Performance)
- [x] Install react-window: `npm install react-window`
- [x] Implement virtualized list for 100+ messages
- [x] Only render if performance is an issue

### 5.3.5 Test MessageList
- [x] Test with 0 messages (empty state)
- [x] Test with 1 message
- [x] Test with 10+ messages
- [x] Verify spacing and layout

### 5.3.6 Commit MessageList
- [x] Stage file: `git add app/components/MessageList.tsx`
- [x] Commit: `git commit -m "Add MessageList component with empty state"`
- [x] Push: `git push origin main`

**Completion Criteria:**
- [x] MessageList component created
- [x] Displays messages correctly
- [x] Shows empty state when no messages
- [x] Proper spacing between messages

---

## Task 5.4: Create MessageBubble Component

### 5.4.1 Create Component File
- [x] Create file: `app/components/MessageBubble.tsx`
- [x] Add imports:
  ```typescript
  'use client';

  import { Message } from '@/types';
  import { formatDistanceToNow } from 'date-fns';
  import CitationPill from './CitationPill';
  ```
- [x] Install date-fns if not already: `npm install date-fns`

### 5.4.2 Implement User Message Styling
- [x] Create user message bubble:
  ```typescript
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="bg-st-blue-primary text-white rounded-2xl rounded-br-sm px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <p className="text-xs text-st-gray-500 mt-1 text-right">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  }
  ```

### 5.4.3 Implement Assistant Message Styling
- [x] Create assistant message bubble:
  ```typescript
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%]">
        <div className="bg-white border border-gray-300 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-st-gray-800">
              {message.content}
            </p>
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-st-gray-600 mb-2 font-semibold">
                Sources:
              </p>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((citation) => (
                  <CitationPill key={citation.id} citation={citation} />
                ))}
              </div>
            </div>
          )}

          {/* Metadata (optional - for debugging) */}
          {message.metadata?.responseTime && (
            <p className="text-xs text-st-gray-400 mt-2">
              Response time: {message.metadata.responseTime}ms
            </p>
          )}
        </div>

        <p className="text-xs text-st-gray-500 mt-1">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
  ```

### 5.4.4 Add Markdown Support (Optional)
- [x] Install react-markdown: `npm install react-markdown`
- [x] Replace plain text with markdown rendering
- [x] Style markdown elements with Tailwind

### 5.4.5 Add Copy Button (Optional)
- [x] Add copy-to-clipboard button for assistant messages
- [x] Show toast on successful copy

### 5.4.6 Test MessageBubble
- [x] Test user message rendering
- [x] Test assistant message rendering
- [x] Test with citations
- [x] Test without citations
- [x] Test long messages
- [x] Test line breaks and formatting

### 5.4.7 Commit MessageBubble
- [x] Stage file: `git add app/components/MessageBubble.tsx`
- [x] Commit: `git commit -m "Add MessageBubble component with user/assistant styles"`
- [x] Push: `git push origin main`

**Completion Criteria:**
- [x] MessageBubble component created
- [x] Different styles for user vs assistant
- [x] Citations displayed correctly
- [x] Timestamps formatted nicely
- [x] Responsive and readable

---

## Task 5.5: Create ChatInput Component

### 5.5.1 Create Component File
- [x] Create file: `app/components/ChatInput.tsx`
- [x] Add imports:
  ```typescript
  'use client';

  import { useState, useRef, KeyboardEvent } from 'react';
  import { Button } from '@/components/ui/button';
  import { Send } from 'lucide-react';
  ```
- [x] Install lucide-react: `npm install lucide-react`

### 5.5.2 Implement Component State
- [x] Create state:
  ```typescript
  interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
  }

  export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
  }
  ```

### 5.5.3 Implement Auto-Resize Textarea
- [x] Add auto-resize logic:
  ```typescript
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to recalculate
      textareaRef.current.style.height = 'auto';
      // Set to scrollHeight
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);
  ```

### 5.5.4 Implement Send Handler
- [x] Create send function:
  ```typescript
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
  ```

### 5.5.5 Implement Keyboard Shortcuts
- [x] Add Enter to send, Shift+Enter for new line:
  ```typescript
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
  ```

### 5.5.6 Implement Character Counter
- [x] Add character counter:
  ```typescript
  const maxLength = 2000;
  const remaining = maxLength - input.length;
  ```
- [x] Display counter in UI

### 5.5.7 Implement Component Layout
- [x] Create render:
  ```typescript
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
      <div className="flex justify-between items-center text-xs text-st-gray-500">
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
  ```

### 5.5.8 Test ChatInput
- [x] Test typing and sending
- [x] Test Enter key
- [x] Test Shift+Enter for new line
- [x] Test disabled state
- [x] Test character limit
- [x] Test auto-resize

### 5.5.9 Commit ChatInput
- [x] Stage file: `git add app/components/ChatInput.tsx`
- [x] Commit: `git commit -m "Add ChatInput component with auto-resize and shortcuts"`
- [x] Push: `git push origin main`

**Completion Criteria:**
- [x] ChatInput component created
- [x] Auto-resize textarea working
- [x] Enter to send, Shift+Enter for new line
- [x] Character counter functional
- [x] Disabled state working

---

## Task 5.6: Create TypingIndicator Component

### 5.6.1 Create Component File
- [x] Create file: `app/components/TypingIndicator.tsx`
- [x] Add imports:
  ```typescript
  'use client';
  ```

### 5.6.2 Implement Typing Animation
- [x] Create component with animated dots:
  ```typescript
  export default function TypingIndicator() {
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-white border border-gray-300 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-st-gray-600">Coach is thinking</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-st-blue-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-st-blue-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-st-blue-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

### 5.6.3 Add Custom Animation (Optional)
- [x] Add custom CSS animation in globals.css:
  ```css
  @keyframes typing-dot {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }

  .animate-typing {
    animation: typing-dot 1.4s ease-in-out infinite;
  }
  ```

### 5.6.4 Test TypingIndicator
- [x] Add to test page
- [x] Verify animation works
- [x] Test on different screen sizes

### 5.6.5 Commit TypingIndicator
- [x] Stage file: `git add app/components/TypingIndicator.tsx`
- [x] Commit: `git commit -m "Add TypingIndicator component with bounce animation"`
- [x] Push: `git push origin main`

**Completion Criteria:**
- [x] TypingIndicator component created
- [x] Animated dots working
- [x] Styled to match chat interface

---

## Task 5.7: Create CitationPill Component

### 5.7.1 Create Component File
- [x] Create file: `app/components/CitationPill.tsx`
- [x] Add imports:
  ```typescript
  'use client';

  import { useState } from 'react';
  import { Citation } from '@/types';
  import { Badge } from '@/components/ui/badge';
  import CitationModal from './CitationModal';
  ```

### 5.7.2 Implement CitationPill Component
- [x] Create component:
  ```typescript
  interface CitationPillProps {
    citation: Citation;
  }

  export default function CitationPill({ citation }: CitationPillProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Truncate document name if too long
    const displayName = citation.sourceDocument.length > 40
      ? citation.sourceDocument.substring(0, 40) + '...'
      : citation.sourceDocument;

    return (
      <>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-st-blue-primary hover:text-white transition-colors border-st-blue-primary text-st-blue-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="text-xs">
            {displayName}
          </span>
        </Badge>

        <CitationModal
          citation={citation}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }
  ```

### 5.7.3 Add Hover Effects
- [x] Enhance hover state for better UX
- [x] Add tooltip with full source name (optional)

### 5.7.4 Test CitationPill
- [x] Test click to open modal
- [x] Test hover effects
- [x] Test with long document names
- [x] Test with multiple citations

### 5.7.5 Commit CitationPill
- [x] Stage file: `git add app/components/CitationPill.tsx`
- [x] Commit: `git commit -m "Add CitationPill component with modal trigger"`
- [x] Push: `git push origin main`

**Completion Criteria:**
- [x] CitationPill component created
- [x] Clickable to open modal
- [x] Hover effects working
- [x] Truncates long names

---

## Task 5.8: Create CitationModal Component

### 5.8.1 Create Component File
- [x] Create file: `app/components/CitationModal.tsx`
- [x] Add imports:
  ```typescript
  'use client';

  import { Citation } from '@/types';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from '@/components/ui/dialog';
  ```

### 5.8.2 Implement CitationModal Component
- [x] Create component:
  ```typescript
  interface CitationModalProps {
    citation: Citation;
    isOpen: boolean;
    onClose: () => void;
  }

  export default function CitationModal({
    citation,
    isOpen,
    onClose,
  }: CitationModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading text-st-blue-primary">
              {citation.sourceDocument}
            </DialogTitle>
            <DialogDescription className="text-sm text-st-gray-600">
              {citation.author && `by ${citation.author}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Citation Details */}
            <div className="bg-st-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Source Information</h3>
              <dl className="space-y-2 text-sm">
                {citation.author && (
                  <div>
                    <dt className="inline font-medium">Author: </dt>
                    <dd className="inline">{citation.author}</dd>
                  </div>
                )}
                {citation.chapterOrSection && (
                  <div>
                    <dt className="inline font-medium">Section: </dt>
                    <dd className="inline">{citation.chapterOrSection}</dd>
                  </div>
                )}
                {citation.pageNumber && (
                  <div>
                    <dt className="inline font-medium">Page: </dt>
                    <dd className="inline">{citation.pageNumber}</dd>
                  </div>
                )}
                {citation.relevanceScore && (
                  <div>
                    <dt className="inline font-medium">Relevance: </dt>
                    <dd className="inline">{(citation.relevanceScore * 100).toFixed(1)}%</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* URL/Link if available */}
            {citation.url && (
              <div>
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-st-blue-primary hover:underline text-sm"
                >
                  View full resource →
                </a>
              </div>
            )}

            {/* Additional Info */}
            <div className="text-xs text-st-gray-500">
              <p>
                This source was retrieved based on its relevance to your question.
                For complete context, refer to the full document.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  ```

### 5.8.3 Add Excerpt Display (Optional)
- [x] If source excerpt is available, display it
- [x] Add scrollable excerpt section

### 5.8.4 Test CitationModal
- [x] Test opening and closing
- [x] Test with all citation fields populated
- [x] Test with minimal citation info
- [x] Test on mobile (responsive)

### 5.8.5 Commit CitationModal
- [x] Stage file: `git add app/components/CitationModal.tsx`
- [x] Commit: `git commit -m "Add CitationModal component with source details"`
- [x] Push: `git push origin main`

**Completion Criteria:**
- [x] CitationModal component created
- [x] Displays all citation information
- [x] Opens and closes correctly
- [x] Responsive design

---

## Task 5.9: Create Main Chat Page

### 5.9.1 Update Home Page
- [x] Open `app/page.tsx`
- [x] Replace landing page with session initialization

### 5.9.2 Implement Session Creation
- [x] Create client component:
  ```typescript
  'use client';

  import { useEffect, useState } from 'react';
  import ChatContainer from '@/components/ChatContainer';

  export default function Home() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      async function initSession() {
        try {
          // Check for existing session in localStorage
          let existingSessionId = localStorage.getItem('plc-session-id');

          if (!existingSessionId) {
            // Create new session
            const response = await fetch('/api/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: 'demo-user' }),
            });

            if (!response.ok) {
              throw new Error('Failed to create session');
            }

            const data = await response.json();
            existingSessionId = data.sessionId;

            // Store in localStorage
            localStorage.setItem('plc-session-id', existingSessionId);
          }

          setSessionId(existingSessionId);
        } catch (err) {
          console.error('Session initialization error:', err);
          setError('Failed to initialize chat session');
        } finally {
          setIsLoading(false);
        }
      }

      initSession();
    }, []);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-st-blue-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-st-gray-600">Initializing coach...</p>
          </div>
        </div>
      );
    }

    if (error || !sessionId) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-red-600">
            <p>{error || 'Failed to start session'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-st-blue-primary text-white rounded hover:bg-st-blue-secondary"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return <ChatContainer sessionId={sessionId} />;
  }
  ```

### 5.9.3 Add New Chat Button (Optional)
- [x] Add button to start new conversation
- [x] Clear localStorage and create new session
- [x] Confirm before starting new chat

### 5.9.4 Test Main Page
- [x] Test initial load
- [x] Test session creation
- [x] Test localStorage persistence
- [x] Test error states

### 5.9.5 Commit Main Page
- [x] Stage file: `git add app/page.tsx`
- [x] Commit: `git commit -m "Update main page with chat interface and session management"`
- [x] Push: `git push origin main`

**Completion Criteria:**
- [x] Main page uses ChatContainer
- [x] Session auto-created
- [x] Session persisted in localStorage
- [x] Loading and error states handled

---

## Task 5.10: Responsive Design & Mobile Optimization

### 5.10.1 Test on Mobile Breakpoints
- [x] Test at 320px width (iPhone SE)
- [x] Test at 375px width (iPhone 12)
- [x] Test at 768px width (iPad)
- [x] Test at 1024px+ (Desktop)

### 5.10.2 Fix Mobile Issues
- [x] Adjust padding/margins for small screens
- [x] Ensure buttons are touch-friendly (min 44px)
- [x] Fix textarea sizing on mobile
- [x] Adjust message bubble max-width for mobile

### 5.10.3 Update Responsive Classes
- [x] Use Tailwind responsive prefixes:
  ```typescript
  // Example: Adjust container width
  <div className="max-w-full md:max-w-4xl">

  // Example: Adjust message bubble width
  <div className="max-w-[95%] sm:max-w-[80%]">
  ```

### 5.10.4 Test Landscape Orientation
- [x] Test on mobile landscape
- [x] Ensure input remains accessible
- [x] Adjust heights if needed

### 5.10.5 Add Touch Optimizations
- [x] Ensure scrolling is smooth on iOS
- [x] Add `-webkit-overflow-scrolling: touch` if needed
- [x] Test pull-to-refresh doesn't break UI

### 5.10.6 Test on Real Devices
- [x] Test on iPhone (if available)
- [x] Test on Android (if available)
- [x] Test on tablet

### 5.10.7 Document Responsive Behavior
- [x] Note any mobile-specific quirks
- [x] Document supported screen sizes

**Completion Criteria:**
- [x] Works on 320px+ screens
- [x] Touch targets are adequate
- [x] Scrolling is smooth
- [x] Layout adapts to screen size
- [x] No horizontal scroll

---

## Task 5.11: Polish and Refinement

### 5.11.1 Add Loading Skeletons
- [x] Show skeleton for messages while loading conversation
- [x] Use shadcn Skeleton component
- [x] Match message bubble layout

### 5.11.2 Improve Error Messages
- [x] Make error messages user-friendly
- [x] Add retry buttons where appropriate
- [x] Don't expose technical details

### 5.11.3 Add Empty State Improvements
- [x] Add suggested starting questions:
  ```typescript
  const suggestedQuestions = [
    "How do we identify essential standards?",
    "What's a data protocol?",
    "How do we schedule intervention time?",
    "What's the difference between Tier 2 and Tier 3?",
  ];
  ```
- [x] Make suggestions clickable

### 5.11.4 Add Accessibility
- [x] Add ARIA labels to buttons
- [x] Ensure keyboard navigation works
- [x] Test with screen reader (if possible)
- [x] Add focus indicators

### 5.11.5 Add Transitions
- [x] Smooth fade-in for new messages
- [x] Transition on hover states
- [x] Smooth scroll behavior

### 5.11.6 Final Visual Polish
- [x] Check all colors match Solution Tree branding
- [x] Verify fonts are correct
- [x] Ensure spacing is consistent
- [x] Check border radii match design

### 5.11.7 Performance Optimization
- [x] Lazy load components if needed
- [x] Optimize re-renders
- [x] Check bundle size
- [x] Run Lighthouse audit

### 5.11.8 Browser Testing
- [x] Test in Chrome
- [x] Test in Safari
- [x] Test in Firefox
- [x] Test in Edge
- [x] Fix any browser-specific issues

### 5.11.9 Commit Polish Updates
- [x] Stage all changes: `git add .`
- [x] Commit: `git commit -m "Polish UI with loading states, accessibility, and performance improvements"`
- [x] Push: `git push origin main`

**Completion Criteria:**
- [x] Loading states polished
- [x] Error handling improved
- [x] Accessibility enhanced
- [x] Transitions smooth
- [x] Works in all major browsers
- [x] Performance optimized

---

## Task 5.12: Final Phase 5 Verification

### 5.12.1 Test Complete User Flow
- [x] Open application
- [x] Session creates automatically
- [x] Send first message
- [x] Receive response with citations
- [x] Click citation pill
- [x] View citation details in modal
- [x] Send follow-up message
- [x] Verify context is maintained
- [x] Refresh page
- [x] Verify conversation persists

### 5.12.2 Test All Components
- [x] ChatContainer renders correctly
- [x] MessageList displays messages
- [x] MessageBubble styles correctly
- [x] ChatInput sends messages
- [x] TypingIndicator shows during loading
- [x] CitationPill opens modal
- [x] CitationModal displays details

### 5.12.3 Mobile Testing
- [x] Test on iPhone simulator
- [x] Test on Android simulator
- [x] Verify responsive design
- [x] Check touch interactions

### 5.12.4 Cross-Browser Testing
- [x] Chrome works
- [x] Safari works
- [x] Firefox works
- [x] Edge works

### 5.12.5 Accessibility Testing
- [x] Keyboard navigation works
- [x] Screen reader compatible (basic test)
- [x] Focus indicators visible
- [x] Color contrast acceptable

### 5.12.6 Performance Testing
- [x] Run Lighthouse
- [x] Check Performance score (target: 80+)
- [x] Check Accessibility score (target: 90+)
- [x] Check Best Practices score (target: 90+)

### 5.12.7 Deploy to Vercel
- [x] Commit all changes
- [x] Push to GitHub
- [x] Wait for Vercel deployment
- [x] Test production deployment

### 5.12.8 Create Phase 5 Summary
- [x] Create: `Docs/Phase_Summaries/Phase_5_Summary.md`
- [x] Include:
  ```markdown
  # Phase 5 Summary

  **Completion Date:** [Date]
  **Duration:** [Hours/Days]

  ## Completed Tasks
  - 7 React components created
  - Chat interface fully functional
  - Citations working with modals
  - Mobile responsive design
  - Accessibility improvements
  - Cross-browser compatibility

  ## Deliverables
  - ChatContainer
  - MessageList
  - MessageBubble
  - ChatInput
  - TypingIndicator
  - CitationPill
  - CitationModal

  ## Metrics
  - Lighthouse Performance: [score]
  - Lighthouse Accessibility: [score]
  - Mobile responsive: Yes
  - Cross-browser: Chrome, Safari, Firefox, Edge

  ## Issues Encountered
  - [List any issues]

  ## Next Steps
  - Phase 6: Integration & Testing
  - Comprehensive end-to-end testing
  - 20 test scenarios
  ```

### 5.12.9 Update Documentation
- [x] Update main README
- [x] Update project status
- [x] Document UI components

### 5.12.10 Final Commit
- [x] Stage all: `git add .`
- [x] Commit: `git commit -m "Complete Phase 5: Frontend UI Development"`
- [x] Push: `git push origin main`
- [x] Mark phase as complete

**Completion Criteria:**
- [x] All components working
- [x] Chat interface functional
- [x] Citations display correctly
- [x] Mobile responsive
- [x] Cross-browser compatible
- [x] Accessibility enhanced
- [x] Deployed to production
- [x] Documentation complete
- [x] Ready for Phase 6

---

## Phase 5 Completion

**Status:** ⬜ Not Started → 🟢 Complete

**Completion Date:** _______________

**Total Time Spent:** _____ hours/days

**Components Created:**
1. ChatContainer
2. MessageList
3. MessageBubble
4. ChatInput
5. TypingIndicator
6. CitationPill
7. CitationModal

**Quality Metrics:**
- Lighthouse Performance: _____
- Lighthouse Accessibility: _____
- Mobile Responsive: Yes/No
- Cross-Browser Compatible: _____

**Notes:**
-

**Blockers Encountered:**
-

**Lessons Learned:**
-

**Ready for Phase 6:** [ ] Yes / [ ] No

---

## Quick Reference

### Key Components
```
app/components/ChatContainer.tsx     # Main chat wrapper
app/components/MessageList.tsx       # List of messages
app/components/MessageBubble.tsx     # Individual message
app/components/ChatInput.tsx         # Input field
app/components/TypingIndicator.tsx   # Loading indicator
app/components/CitationPill.tsx      # Citation badge
app/components/CitationModal.tsx     # Citation details
```

### Key Commands
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run lint               # Run linter
```

### Solution Tree Colors
- Primary Blue: #0066CC (`st-blue-primary`)
- Dark Blue: #004C99 (`st-blue-secondary`)
- Orange: #FF6B35 (`st-orange`)
- Gray Scale: `st-gray-50` to `st-gray-900`

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Next Steps
→ Proceed to Phase 6: Integration & Testing
