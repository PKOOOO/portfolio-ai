import { writeClient } from "@/sanity/lib/writeClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      chatId,
      messageCount,
      toolsUsed,
      firstMessage,
      messages,
    } = body;

    if (!sessionId) {
      return Response.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    const docId = chatId || `chat-${sessionId}-${Date.now()}`;

    await writeClient.createOrReplace({
      _id: docId,
      _type: "chatSession",
      sessionId,
      messageCount: messageCount || 1,
      toolsUsed: toolsUsed || [],
      firstMessage: firstMessage || null,
      messages: (messages || []).map(
        (m: { role: string; content: string }, i: number) => ({
          _key: `msg-${i}`,
          role: m.role,
          content: m.content,
        }),
      ),
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Analytics] Chat session tracking error:", error);
    return Response.json(
      { error: "Failed to track chat session" },
      { status: 500 },
    );
  }
}
