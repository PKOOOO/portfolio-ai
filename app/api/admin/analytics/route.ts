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
    const fourteenDaysAgo = new Date(
      now.getTime() - 14 * 24 * 60 * 60 * 1000,
    );

    const [
      pageViews7d,
      pageViewsPrev7d,
      allPageViews,
      chatSessions7d,
      chatSessionsPrev7d,
      toolUsageData,
      recentChats,
      deviceData,
      dailyViewsRaw,
    ] = await Promise.all([
      sanityClient.fetch<number>(
        `count(*[_type == "pageView" && timestamp >= $start])`,
        { start: sevenDaysAgo.toISOString() },
      ),
      sanityClient.fetch<number>(
        `count(*[_type == "pageView" && timestamp >= $start && timestamp < $end])`,
        {
          start: fourteenDaysAgo.toISOString(),
          end: sevenDaysAgo.toISOString(),
        },
      ),
      sanityClient.fetch<{ path: string }[]>(
        `*[_type == "pageView" && timestamp >= $start] { path }`,
        { start: sevenDaysAgo.toISOString() },
      ),
      sanityClient.fetch<number>(
        `count(*[_type == "chatSession" && timestamp >= $start])`,
        { start: sevenDaysAgo.toISOString() },
      ),
      sanityClient.fetch<number>(
        `count(*[_type == "chatSession" && timestamp >= $start && timestamp < $end])`,
        {
          start: fourteenDaysAgo.toISOString(),
          end: sevenDaysAgo.toISOString(),
        },
      ),
      sanityClient.fetch<{ toolsUsed: string[] }[]>(
        `*[_type == "chatSession" && timestamp >= $start] { toolsUsed }`,
        { start: sevenDaysAgo.toISOString() },
      ),
      sanityClient.fetch<
        {
          firstMessage: string;
          messageCount: number;
          timestamp: string;
          messages: { role: string; content: string }[];
          toolsUsed: string[];
        }[]
      >(
        `*[_type == "chatSession" && timestamp >= $start] | order(timestamp desc) [0...10] { firstMessage, messageCount, timestamp, messages, toolsUsed }`,
        { start: sevenDaysAgo.toISOString() },
      ),
      sanityClient.fetch<{ deviceType: string }[]>(
        `*[_type == "pageView" && timestamp >= $start] { deviceType }`,
        { start: sevenDaysAgo.toISOString() },
      ),
      sanityClient.fetch<{ timestamp: string }[]>(
        `*[_type == "pageView" && timestamp >= $start] | order(timestamp asc) { timestamp }`,
        { start: sevenDaysAgo.toISOString() },
      ),
    ]);

    const pageCountMap = new Map<string, number>();
    for (const pv of allPageViews)
      pageCountMap.set(pv.path, (pageCountMap.get(pv.path) || 0) + 1);
    const topPages = Array.from(pageCountMap.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const toolCountMap = new Map<string, number>();
    for (const s of toolUsageData)
      if (s.toolsUsed)
        for (const t of s.toolsUsed)
          toolCountMap.set(t, (toolCountMap.get(t) || 0) + 1);
    const topTools = Array.from(toolCountMap.entries())
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count);

    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    for (const d of deviceData) {
      if (d.deviceType === "desktop") devices.desktop++;
      else if (d.deviceType === "mobile") devices.mobile++;
      else if (d.deviceType === "tablet") devices.tablet++;
    }

    const dailyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      dailyMap.set(d, 0);
    }
    for (const pv of dailyViewsRaw) {
      const d = pv.timestamp.split("T")[0];
      if (dailyMap.has(d)) dailyMap.set(d, (dailyMap.get(d) || 0) + 1);
    }
    const dailyViews = Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      count,
    }));

    const viewsChange =
      pageViewsPrev7d > 0
        ? ((pageViews7d - pageViewsPrev7d) / pageViewsPrev7d) * 100
        : pageViews7d > 0
          ? 100
          : 0;
    const chatChange =
      chatSessionsPrev7d > 0
        ? ((chatSessions7d - chatSessionsPrev7d) / chatSessionsPrev7d) * 100
        : chatSessions7d > 0
          ? 100
          : 0;

    return Response.json({
      success: true,
      data: {
        overview: {
          totalPageViews: pageViews7d,
          viewsChange: Number(viewsChange.toFixed(1)),
          totalChatSessions: chatSessions7d,
          chatChange: Number(chatChange.toFixed(1)),
          topPage: topPages[0]?.path || "N/A",
        },
        dailyViews,
        topPages,
        devices,
        chatAnalytics: { totalSessions: chatSessions7d, topTools, recentChats },
      },
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[Admin Analytics] Error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
