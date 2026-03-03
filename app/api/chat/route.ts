import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { createPortfolioAgent } from "@/lib/ai/portfolio-agent";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON in request body", { status: 400 });
  }

  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response("messages parameter must be provided as an array", {
      status: 400,
    });
  }

  const agent = createPortfolioAgent();

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages as UIMessage[],
  });
}

