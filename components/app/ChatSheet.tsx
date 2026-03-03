"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useIsChatOpen,
  useChatActions,
  usePendingMessage,
} from "@/lib/store/chat-store-provider";
import {
  getMessageText,
  getToolParts,
  WelcomeScreen,
  MessageBubble,
  ToolCallUI,
} from "./chat";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("analytics_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", id);
  }
  return id;
}

export function ChatSheet() {
  const isOpen = useIsChatOpen();
  const { closeChat, clearPendingMessage } = useChatActions();
  const pendingMessage = usePendingMessage();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef<string>(`chat-${Date.now()}`);
  const lastLoggedCount = useRef(0);

  const { messages, sendMessage, status } = useChat();
  const isLoading = status === "streaming" || status === "submitted";

  const logChatSession = useCallback(() => {
    if (messages.length === 0 || messages.length === lastLoggedCount.current)
      return;
    lastLoggedCount.current = messages.length;

    const userMessages = messages.filter((m) => m.role === "user");
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const firstMsg = userMessages[0]
      ? getMessageText(userMessages[0])
      : "General conversation";

    const toolsUsed = new Set<string>();
    for (const msg of messages) {
      const parts = getToolParts(msg);
      for (const part of parts) {
        toolsUsed.add(part.toolName);
      }
    }

    const serializedMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: getMessageText(m) || "(tool call)",
      }));

    fetch("/api/analytics/chat-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getSessionId(),
        chatId: chatIdRef.current,
        messageCount: userMessages.length + assistantMessages.length,
        toolsUsed: Array.from(toolsUsed),
        firstMessage: firstMsg.slice(0, 200),
        messages: serializedMessages.slice(-20),
      }),
    }).catch(() => {});
  }, [messages]);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      logChatSession();
    }
  }, [isLoading, messages.length, logChatSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen && pendingMessage && !isLoading) {
      sendMessage({ text: pendingMessage });
      clearPendingMessage();
    }
  }, [isOpen, pendingMessage, isLoading, sendMessage, clearPendingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 xl:hidden"
        onClick={closeChat}
        aria-hidden="true"
      />

      <div className="fixed top-0 right-0 z-50 flex h-full w-full flex-col border-l border-zinc-200 bg-white shadow-xl overscroll-contain dark:border-zinc-800 dark:bg-zinc-950 xl:w-[380px] animate-in slide-in-from-right duration-300">
        <header className="shrink-0">
          <div className="flex h-16 items-center gap-3 px-4">
            <Button variant="ghost" size="icon" onClick={closeChat}>
              <X className="size-6" />
            </Button>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Portfolio AI Assistant
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={sendMessage}
              isSignedIn={false}
            />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const content = getMessageText(message);
                const toolParts = getToolParts(message);
                const hasContent = content.length > 0;
                const hasTools = toolParts.length > 0;

                if (!hasContent && !hasTools) return null;

                return (
                  <div key={message.id} className="space-y-3">
                    {hasTools &&
                      toolParts.map((toolPart) => (
                        <ToolCallUI
                          key={`tool-${message.id}-${toolPart.toolCallId}`}
                          toolPart={toolPart}
                          closeChat={closeChat}
                        />
                      ))}

                    {hasContent && (
                      <MessageBubble
                        role={message.role}
                        content={content}
                        closeChat={closeChat}
                      />
                    )}
                  </div>
                );
              })}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skills, projects, or experience..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

