"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createSession } from "@/app/actions/create-session";
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
    // Fallback handler used by multiple ChatKit events
    onMessage: async (message: { role?: string; content?: string; text?: string; id?: string; messageId?: string }) => {
      // Debug: observe raw message events from ChatKit
      try {
        console.debug("[Chat:onMessage] raw:", JSON.stringify(message));
      } catch {}
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
          // Create initial conversation immediately using this user message
          try {
            const bootstrap = {
              role: "user" as const,
              content: messageContent,
              timestamp: new Date().toISOString(),
              messageId: `${Date.now()}-${Math.random()}`,
            };
            messageHistoryRef.current.push(bootstrap);
            console.debug("[Chat:email-captured] creating conversation with bootstrap message", bootstrap);
            const res = await fetch("/api/chat/log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: extractedEmail,
                sessionId,
                messages: messageHistoryRef.current,
              }),
            });
            if (!res.ok) {
              const errText = await res.text();
              console.error("/api/chat/log failed (email-captured):", res.status, errText);
            }
          } catch (e) {
            console.error("Failed to create conversation on email capture:", e);
          }
          window.location.reload(); // Reload to update email state after creating conversation
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
      console.debug("[Chat:onMessage] appended to history:", messageData);

      // Save to Sanity every message (use current email or temp)
      try {
        const currentEmail = userEmailRef.current || "pending@temp.local";
        // Call API route to ensure write from server context
        const payload = {
          email: currentEmail,
          sessionId,
          messages: messageHistoryRef.current,
        };
        console.debug("[Chat:onMessage] POST /api/chat/log payload:", payload);
        const res = await fetch("/api/chat/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("/api/chat/log failed:", res.status, errText);
        }
        console.debug("[Chat:onMessage] /api/chat/log status:", res.status);
      } catch (error) {
        console.error("Failed to save message:", error);
      }
    },
    // Some ChatKit versions emit user messages via a separate hook
    onUserMessage: async (message: { text?: string; id?: string }) => {
      try {
        console.debug("[Chat:onUserMessage] raw:", JSON.stringify(message));
      } catch {}
      const content = message.text || "";
      const msg = {
        role: "user" as const,
        content,
        timestamp: new Date().toISOString(),
        messageId: message.id || `${Date.now()}-${Math.random()}`,
      };
      messageHistoryRef.current.push(msg);
      console.debug("[Chat:onUserMessage] appended:", msg);
      try {
        const currentEmail = userEmailRef.current || "pending@temp.local";
        const payload = { email: currentEmail, sessionId, messages: messageHistoryRef.current };
        console.debug("[Chat:onUserMessage] POST /api/chat/log payload:", payload);
        const res = await fetch("/api/chat/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("/api/chat/log failed (onUserMessage):", res.status, errText);
        }
        console.debug("[Chat:onUserMessage] /api/chat/log status:", res.status);
      } catch (error) {
        console.error("Failed to save message (onUserMessage):", error);
      }
    },
    // Assistant responses may arrive here depending on SDK
    onResponse: async (response: { text?: string; id?: string }) => {
      try {
        console.debug("[Chat:onResponse] raw:", JSON.stringify(response));
      } catch {}
      const content = response.text || "";
      const msg = {
        role: "assistant" as const,
        content,
        timestamp: new Date().toISOString(),
        messageId: response.id || `${Date.now()}-${Math.random()}`,
      };
      messageHistoryRef.current.push(msg);
      console.debug("[Chat:onResponse] appended:", msg);
      try {
        const currentEmail = userEmailRef.current || "pending@temp.local";
        const payload = { email: currentEmail, sessionId, messages: messageHistoryRef.current };
        console.debug("[Chat:onResponse] POST /api/chat/log payload:", payload);
        const res = await fetch("/api/chat/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("/api/chat/log failed (onResponse):", res.status, errText);
        }
        console.debug("[Chat:onResponse] /api/chat/log status:", res.status);
      } catch (error) {
        console.error("Failed to save message (onResponse):", error);
      }
    },
    // Catch-all low-level stream events from ChatKit runtime
    onThreadEvent: async (event: unknown) => {
      try {
        console.debug("[Chat:onThreadEvent]", event?.type);
      } catch {}
      try {
        // Attempt to normalize into a message when possible
        const e = event as { message?: { role?: string; content?: Array<{ text?: { value?: string } }> }; output_text?: string; delta?: string; type?: string } | undefined;
        const maybeRole = e?.message?.role as "user" | "assistant" | undefined;
        const maybeText = e?.message?.content?.[0]?.text?.value
          || event?.output_text
          || event?.delta
          || "";
        if (!maybeText) return;
        const msg = {
          role: (maybeRole === "user" || maybeRole === "assistant") ? maybeRole : "assistant" as const,
          content: String(maybeText),
          timestamp: new Date().toISOString(),
          messageId: `${Date.now()}-${Math.random()}`,
        };
        messageHistoryRef.current.push(msg);
        console.debug("[Chat:onThreadEvent] appended:", msg);
        const currentEmail = userEmailRef.current || "pending@temp.local";
        const payload = { email: currentEmail, sessionId, messages: messageHistoryRef.current };
        const res = await fetch("/api/chat/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("/api/chat/log failed (onThreadEvent):", res.status, errText);
        }
        console.debug("[Chat:onThreadEvent] /api/chat/log status:", res.status);
      } catch (err) {
        console.error("Failed to save message (onThreadEvent):", err);
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
