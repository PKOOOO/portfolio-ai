"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createSession } from "@/app/actions/create-session";
import { saveChatMessage } from "@/app/actions/save-chat-message";
import type { CHAT_PROFILE_QUERYResult } from "@/sanity.types";
import { useSidebar } from "../ui/sidebar";
import { useRef } from "react";

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
    // Note: ChatKit event handlers depend on available events
    // Common events might be: onMessage, onUserMessage, onResponse
    onMessage: async (message: { role?: string; content?: string; text?: string; id?: string; messageId?: string }) => {
      const messageContent = message.content || message.text || "";
      const messageRole = (message.role || "user") as "user" | "assistant";
      
      // Check if this is a user message and we need email
      if (messageRole === "user" && needsEmailRef.current) {
        const emailMatch = messageContent.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
          const extractedEmail = emailMatch[0];
          userEmailRef.current = extractedEmail;
          needsEmailRef.current = false;
          localStorage.setItem("chatUserEmail", extractedEmail);
          window.location.reload(); // Reload to update email state
        }
      }

      // Capture messages
      const messageData = {
        role: messageRole,
        content: messageContent,
        timestamp: new Date().toISOString(),
        messageId: message.id || message.messageId || `${Date.now()}-${Math.random()}`,
      };

      messageHistoryRef.current.push(messageData);

      // Save to Sanity every message (use current email or temp)
      try {
        const currentEmail = userEmailRef.current || "pending@temp.local";
        await saveChatMessage(currentEmail, sessionId, messageHistoryRef.current);
      } catch (error) {
        console.error("Failed to save message:", error);
      }
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

  return <ChatKit control={control} className="h-full w-full z-50" />;
}

export default Chat;
