"use client";

import { useEffect, useState, useRef } from "react";
import {
  Eye,
  Users,
  MessageSquare,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  StatCard,
  PageViewsChart,
  TopPagesTable,
  ChatAnalyticsCard,
  AIInsightsCard,
} from "@/components/admin";

interface AnalyticsData {
  overview: {
    totalPageViews: number;
    viewsChange: number;
    totalChatSessions: number;
    chatChange: number;
    topPage: string;
  };
  dailyViews: { date: string; label: string; count: number }[];
  topPages: { path: string; count: number }[];
  devices: { desktop: number; mobile: number; tablet: number };
  chatAnalytics: {
    totalSessions: number;
    topTools: { tool: string; count: number }[];
    recentChats: {
      firstMessage: string;
      messageCount: number;
      timestamp: string;
      messages?: { role: string; content: string }[];
      toolsUsed?: string[];
    }[];
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setData(result.data);
        else setError(result.error || "Failed to load analytics");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Loading analytics...
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
            />
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );

  if (!data) return null;
  const totalDevices =
    data.devices.desktop + data.devices.mobile + data.devices.tablet;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Website analytics & AI chat usage — Last 7 days
        </p>
      </div>

      <AIInsightsCard />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Page Views"
          value={data.overview.totalPageViews.toLocaleString()}
          change={data.overview.viewsChange}
          icon={Eye}
          subtitle="vs previous 7 days"
        />
        <StatCard
          title="AI Chat Sessions"
          value={data.overview.totalChatSessions.toLocaleString()}
          change={data.overview.chatChange}
          icon={MessageSquare}
          subtitle="vs previous 7 days"
        />
        <StatCard
          title="Top Page"
          value={data.overview.topPage}
          icon={Users}
          subtitle="Most visited page"
        />
        <StatCard
          title="Devices"
          value={
            totalDevices > 0
              ? `${((data.devices.mobile / totalDevices) * 100).toFixed(0)}% mobile`
              : "N/A"
          }
          icon={
            data.devices.mobile > data.devices.desktop
              ? Smartphone
              : data.devices.tablet > 0
                ? Tablet
                : Monitor
          }
          subtitle={`${data.devices.desktop} desktop · ${data.devices.mobile} mobile · ${data.devices.tablet} tablet`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageViewsChart />
        <TopPagesTable pages={data.topPages} />
      </div>

      <ChatAnalyticsCard
        totalSessions={data.chatAnalytics.totalSessions}
        topTools={data.chatAnalytics.topTools}
        recentChats={data.chatAnalytics.recentChats}
      />
    </div>
  );
}
