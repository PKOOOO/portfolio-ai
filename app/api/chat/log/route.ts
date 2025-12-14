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
    
    console.log("\n========================================");
    console.log("[API /chat/log] 📥 RECEIVED REQUEST");
    console.log("========================================");
    console.log("Email:", email);
    console.log("Session ID:", sessionId);
    console.log("Message Count:", messages?.length);
    console.log("Latest Message:", messages?.[messages.length - 1]);
    console.log("========================================\n");
    
    if (!email || !sessionId || !Array.isArray(messages) || messages.length === 0) {
      console.error("\n❌ VALIDATION FAILED:");
      console.error("- Email:", email || "MISSING");
      console.error("- SessionID:", sessionId || "MISSING");
      console.error("- Messages:", messages?.length || "MISSING/EMPTY");
      console.error("\n");
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const lastTimestamp = messages[messages.length - 1]?.timestamp || now;

    // Upsert conversation
    console.log("🔍 Searching for existing conversation...");
    const existingConversation = await serverClient.fetch(
      `*[_type == "conversation" && sessionId == $sessionId][0]`,
      { sessionId },
    );

    if (existingConversation) {
      console.log("✓ Found existing conversation:", existingConversation._id);
    } else {
      console.log("✓ No existing conversation found, will create new");
    }

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
      console.log("\n📝 UPDATING existing conversation:", existingConversation._id);
      console.log("- Previous message count:", existingConversation.messages?.length || 0);
      console.log("- New message count:", conversationPayload.messages.length);
      
      await serverClient
        .patch(existingConversation._id)
        .set({
          lastMessageAt: conversationPayload.lastMessageAt,
          messages: conversationPayload.messages,
          status: conversationPayload.status,
        })
        .commit();
      
      console.log("✅ SUCCESSFULLY UPDATED conversation!");
      console.log(`   Email: ${email}`);
      console.log(`   Messages: ${conversationPayload.messages.length}`);
      console.log(`   Document ID: ${existingConversation._id}\n`);
    } else {
      console.log("\n✨ CREATING new conversation");
      console.log("- Email:", email);
      console.log("- Session ID:", sessionId);
      console.log("- Initial messages:", conversationPayload.messages.length);
      
      const result = await serverClient.create({ _type: "conversation", ...conversationPayload });
      
      console.log("✅ SUCCESSFULLY CREATED new conversation!");
      console.log(`   Email: ${email}`);
      console.log(`   Document ID: ${result._id}`);
      console.log(`   Messages: ${conversationPayload.messages.length}\n`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("\n❌❌❌ ERROR in /api/chat/log ❌❌❌");
    console.error(error);
    console.error("❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n");
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save message" },
      { status: 500 },
    );
  }
}


