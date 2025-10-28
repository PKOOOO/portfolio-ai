"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createSession } from "@/app/actions/create-session";
import type { CHAT_PROFILE_QUERYResult } from "@/sanity.types";
import { useSidebar } from "../ui/sidebar";
import { useRef, useEffect } from "react";

export function Chat({
  profile,
  email,
  sessionId,
}: {
  profile: CHAT_PROFILE_QUERYResult | null;
  email: string;
  sessionId: string;
}) {
  const { toggleSidebar } = useSidebar();
  const messageHistoryRef = useRef<Array<{ role: "user" | "assistant"; content: string; timestamp: string; messageId: string }>>([]);
  const userEmailRef = useRef<string>(email);
  const needsEmailRef = useRef<boolean>(!email);
  // Generate greeting based on available profile data
  const getGreeting = () => {
    if (!profile?.firstName) {
      return "Hi there! Ask me anything about my work, experience, or projects.";
    }

    // The .filter(Boolean) removes all falsy values from the array, so if the firstName or lastName is not set, it will be removed
    const fullName = [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ");

    return `Hi! I'm ${fullName}. Ask me anything about my work, experience, or projects.`;
  };

  const { control } = useChatKit({
    api: {
      getClientSecret: async (_existingSecret) => {
        // Use temporary email if we don't have one yet
        const tempEmail = userEmailRef.current || `temp-${Date.now()}@pending.local`;
        return createSession(tempEmail);
      },
    },
    startScreen: {
      greeting: needsEmailRef.current 
        ? "Hi! To start chatting, please provide your email address so I can track our conversation."
        : getGreeting(),
      prompts: needsEmailRef.current ? [] : [
        {
          icon: "suitcase",
          label: "What's your experience?",
          prompt: "Tell me about your professional experience and previous roles",
        },
        {
          icon: "square-code",
          label: "What skills do you have?",
          prompt: "What technologies and programming languages do you specialize in?",
        },
        {
          icon: "cube",
          label: "What have you built?",
          prompt: "Show me some of your most interesting projects",
        },
        {
          icon: "profile",
          label: "Who are you?",
          prompt: "Tell me more about yourself and your background",
        },
      ],
    },
    // https://chatkit.studio/playground
    theme: {},
    header: {
      title: {
        text: `Chat with ${profile?.firstName || "Me"} `,
      },
      leftAction: {
        icon: "close",
        onClick: () => {
          toggleSidebar();
        },
      },
    },
    composer: {
      models: [
        {
          id: "crisp",
          label: "Crisp",
          description: "Concise and factual",
        },
        {
          id: "clear",
          label: "Clear",
          description: "Focused and helpful",
        },
        {
          id: "chatty",
          label: "Chatty",
          description: "Conversational companion",
        },
      ],
    },

    disclaimer: {
      text: "Disclaimer: This is my AI-powered twin. It may not be 100% accurate and should be verified for accuracy.",
    },
  });

  // Capture messages using MutationObserver to watch for DOM changes
  useEffect(() => {
    const handleNewMessage = async (messageElement: HTMLElement) => {
      try {
        const messageText = messageElement.textContent || "";
        if (!messageText.trim()) return;

        // Determine role based on class names or data attributes
        const classList = messageElement.className || "";
        const isUser = classList.includes("user") || messageElement.getAttribute("data-role") === "user";
        const role: "user" | "assistant" = isUser ? "user" : "assistant";

        // Check if this is a user message and we need email
        if (role === "user" && needsEmailRef.current) {
          const emailMatch = messageText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
          if (emailMatch) {
            const extractedEmail = emailMatch[0];
            userEmailRef.current = extractedEmail;
            needsEmailRef.current = false;
            localStorage.setItem("chatUserEmail", extractedEmail);
            
            const bootstrap = {
              role: "user" as const,
              content: messageText.trim(),
              timestamp: new Date().toISOString(),
              messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };
            messageHistoryRef.current.push(bootstrap);
            
            console.debug("[Chat:email-captured]", bootstrap);
            
            await fetch("/api/chat/log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: extractedEmail,
                sessionId,
                messages: messageHistoryRef.current,
              }),
            });
            
            window.location.reload();
            return;
          }
        }

        // Add message to history
        const messageData = {
          role,
          content: messageText.trim(),
          timestamp: new Date().toISOString(),
          messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        messageHistoryRef.current.push(messageData);
        console.debug("[Chat:message-captured]", messageData);

        // Save to Sanity
        const currentEmail = userEmailRef.current || "pending@temp.local";
        await fetch("/api/chat/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentEmail,
            sessionId,
            messages: messageHistoryRef.current,
          }),
        });
      } catch (error) {
        console.error("[Chat:capture-error]", error);
      }
    };

    // Use MutationObserver to detect new messages in the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            // Look for message elements (adjust selector based on ChatKit's DOM structure)
            if (
              element.matches('[data-message], .message, [role="article"]') ||
              element.querySelector('[data-message], .message, [role="article"]')
            ) {
              const messageEl = element.matches('[data-message], .message, [role="article"]') 
                ? element 
                : element.querySelector('[data-message], .message, [role="article"]') as HTMLElement;
              
              if (messageEl) {
                handleNewMessage(messageEl);
              }
            }
          }
        });
      });
    });

    // Start observing after a short delay to let ChatKit render
    const timeoutId = setTimeout(() => {
      const chatContainer = document.querySelector('[data-chatkit], .chatkit, [data-chat-container]');
      if (chatContainer) {
        observer.observe(chatContainer, {
          childList: true,
          subtree: true,
        });
        console.debug("[Chat:observer] Started watching for messages");
      } else {
        console.warn("[Chat:observer] Chat container not found");
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [sessionId]);

  return <ChatKit control={control} className="h-full w-full z-50" />;
}

export default Chat;
