import { NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/serverClient";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  messageId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email: string;
      sessionId: string;
      messages: ChatMessage[];
    };

    const { email, sessionId, messages } = body || {};
    
    console.log("[/api/chat/log] Received:", { email, sessionId, messageCount: messages?.length });
    
    if (!email || !sessionId || !Array.isArray(messages) || messages.length === 0) {
      console.error("[/api/chat/log] Validation failed:", { email, sessionId, messagesLength: messages?.length });
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const lastTimestamp = messages[messages.length - 1]?.timestamp || now;

    // Upsert conversation
    const existingConversation = await serverClient.fetch(
      `*[_type == "conversation" && sessionId == $sessionId][0]`,
      { sessionId },
    );

    const conversationPayload = {
      email,
      sessionId,
      status: "active" as const,
      startedAt: existingConversation?.startedAt || now,
      lastMessageAt: lastTimestamp,
      messages: messages.map((m) => ({
        _key: m.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    };

    if (existingConversation?._id) {
      console.log("[/api/chat/log] Patching existing conversation:", existingConversation._id);
      await serverClient
        .patch(existingConversation._id)
        .set({
          lastMessageAt: conversationPayload.lastMessageAt,
          messages: conversationPayload.messages,
          status: conversationPayload.status,
        })
        .commit();
      console.log("[/api/chat/log] ✅ Patched successfully");
    } else {
      console.log("[/api/chat/log] Creating new conversation");
      const result = await serverClient.create({ _type: "conversation", ...conversationPayload });
      console.log("[/api/chat/log] ✅ Created successfully:", result._id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/chat/log error", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save message" },
      { status: 500 },
    );
  }
}


