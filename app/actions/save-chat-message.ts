"use server";

import { serverClient } from "@/sanity/lib/serverClient";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  messageId: string;
}

export async function saveChatMessage(
  email: string,
  sessionId: string,
  messages: ChatMessage[],
) {
  try {
    if (!email || !sessionId || !messages || messages.length === 0) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if session already exists
    const existingSession = await serverClient.fetch(
      `*[_type == "chatSession" && sessionId == $sessionId][0]`,
      { sessionId },
    );

    const now = new Date().toISOString();

    if (existingSession) {
      // Update existing session with new messages
      await serverClient
        .patch(existingSession._id)
        .set({
          lastActivityAt: now,
          messageHistory: messages,
        })
        .commit();
    } else {
      // Create new session
      await serverClient.create({
        _type: "chatSession",
        email,
        sessionId,
        startedAt: now,
        lastActivityAt: now,
        messageHistory: messages,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving chat message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save message",
    };
  }
}

