import { generateText, gateway } from "ai";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [pageViews, chatSessions, topPagesRaw] = await Promise.all([
      sanityClient.fetch<number>(
        `count(*[_type == "pageView" && timestamp >= $start])`,
        { start: sevenDaysAgo.toISOString() },
      ),
      sanityClient.fetch<
        {
          firstMessage: string;
          toolsUsed: string[];
          messageCount: number;
        }[]
      >(
        `*[_type == "chatSession" && timestamp >= $start] { firstMessage, toolsUsed, messageCount }`,
        { start: sevenDaysAgo.toISOString() },
      ),
      sanityClient.fetch<{ path: string }[]>(
        `*[_type == "pageView" && timestamp >= $start] { path }`,
        { start: sevenDaysAgo.toISOString() },
      ),
    ]);

    const pageCountMap = new Map<string, number>();
    for (const pv of topPagesRaw)
      pageCountMap.set(pv.path, (pageCountMap.get(pv.path) || 0) + 1);
    const topPages = Array.from(pageCountMap.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const toolCounts = new Map<string, number>();
    for (const s of chatSessions)
      if (s.toolsUsed)
        for (const t of s.toolsUsed)
          toolCounts.set(t, (toolCounts.get(t) || 0) + 1);

    const dataSummary = {
      period: "Last 7 days",
      website: {
        totalPageViews: pageViews,
        topPages,
        description: "Personal developer portfolio website",
      },
      aiChat: {
        totalSessions: chatSessions.length,
        averageMessages:
          chatSessions.length > 0
            ? (
                chatSessions.reduce((s, c) => s + c.messageCount, 0) /
                chatSessions.length
              ).toFixed(1)
            : 0,
        topQuestions: chatSessions
          .filter((c) => c.firstMessage)
          .slice(0, 5)
          .map((c) => c.firstMessage),
        toolUsage: Array.from(toolCounts.entries()).map(([tool, count]) => ({
          tool,
          count,
        })),
      },
    };

    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      system: `You are a website analytics expert for a developer portfolio. Analyze the provided data and generate actionable insights.

Your response must be valid JSON:
{
  "websiteHealth": { "summary": "2-3 sentences", "highlights": ["..."], "trend": "up"|"down"|"stable" },
  "aiChatInsights": { "summary": "2-3 sentences", "popularTopics": ["..."], "recommendations": ["..."] },
  "actionItems": { "urgent": ["..."], "recommended": ["..."], "opportunities": ["..."] }
}

Be specific with numbers. Keep items concise (under 100 chars).`,
      prompt: `Analyze this website analytics data:\n\n${JSON.stringify(dataSummary, null, 2)}\n\nGenerate insights in the required JSON format.`,
    });

    let insights;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (!insights) throw new Error("No JSON");
    } catch {
      insights = {
        websiteHealth: {
          summary: `${pageViews} page views in the last 7 days.`,
          highlights: [
            `${pageViews} total page views`,
            topPages[0]
              ? `Most visited: ${topPages[0].path}`
              : "No page data yet",
            `${chatSessions.length} AI chat sessions`,
          ],
          trend: (pageViews > 10 ? "up" : "stable") as "up" | "stable",
        },
        aiChatInsights: {
          summary: `${chatSessions.length} chat sessions recorded.`,
          popularTopics: chatSessions
            .slice(0, 2)
            .map((c) => c.firstMessage || "General inquiry"),
          recommendations: ["Promote AI assistant on the homepage"],
        },
        actionItems: {
          urgent: ["Review analytics data regularly"],
          recommended: ["Add more content to popular pages"],
          opportunities: ["Use chat insights to improve FAQ sections"],
        },
      };
    }

    return Response.json({
      success: true,
      insights,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[Admin Insights] Error:", error);
    return Response.json(
      { success: false, error: "Failed to generate insights" },
      { status: 500 },
    );
  }
}
