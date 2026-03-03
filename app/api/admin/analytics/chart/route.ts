import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    const now = new Date();
    let days: number;
    let groupBy: "day" | "week";

    switch (range) {
      case "90d":
        days = 90;
        groupBy = "week";
        break;
      case "30d":
        days = 30;
        groupBy = "day";
        break;
      default:
        days = 7;
        groupBy = "day";
    }

    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const pageViews = await sanityClient.fetch<
      { timestamp: string; sessionId: string | null }[]
    >(
      `*[_type == "pageView" && timestamp >= $start] | order(timestamp asc) { timestamp, sessionId }`,
      { start: start.toISOString() },
    );

    interface DataPoint {
      date: string;
      label: string;
      views: number;
      visitors: number;
    }

    let data: DataPoint[];

    if (groupBy === "week") {
      const weekMap = new Map<
        string,
        { label: string; views: number; sessions: Set<string> }
      >();
      for (let i = Math.ceil(days / 7) - 1; i >= 0; i--) {
        const weekStart = new Date(
          now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000,
        );
        const key = weekStart.toISOString().split("T")[0];
        const label = weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        weekMap.set(key, {
          label: `Wk ${label}`,
          views: 0,
          sessions: new Set(),
        });
      }

      const weekKeys = Array.from(weekMap.keys()).sort();
      for (const pv of pageViews) {
        const pvDate = new Date(pv.timestamp);
        for (let i = weekKeys.length - 1; i >= 0; i--) {
          if (pvDate >= new Date(weekKeys[i])) {
            const entry = weekMap.get(weekKeys[i])!;
            entry.views++;
            if (pv.sessionId) entry.sessions.add(pv.sessionId);
            break;
          }
        }
      }

      data = Array.from(weekMap.entries()).map(([date, val]) => ({
        date,
        label: val.label,
        views: val.views,
        visitors: val.sessions.size,
      }));
    } else {
      const dailyMap = new Map<
        string,
        { views: number; sessions: Set<string> }
      >();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        dailyMap.set(d, { views: 0, sessions: new Set() });
      }
      for (const pv of pageViews) {
        const d = pv.timestamp.split("T")[0];
        const entry = dailyMap.get(d);
        if (entry) {
          entry.views++;
          if (pv.sessionId) entry.sessions.add(pv.sessionId);
        }
      }

      data = Array.from(dailyMap.entries()).map(([date, val]) => {
        const dateObj = new Date(date);
        const label =
          days <= 7
            ? dateObj.toLocaleDateString("en-US", { weekday: "short" })
            : dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
        return { date, label, views: val.views, visitors: val.sessions.size };
      });
    }

    const totalViews = pageViews.length;
    const uniqueSessions = new Set(
      pageViews.map((pv) => pv.sessionId).filter(Boolean),
    );
    const totalVisitors = uniqueSessions.size;

    return Response.json({
      success: true,
      data,
      totalViews,
      totalVisitors,
      range,
    });
  } catch (error) {
    console.error("[Admin Chart] Error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch chart data" },
      { status: 500 },
    );
  }
}
