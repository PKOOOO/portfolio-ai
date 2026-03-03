"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Loader2,
  Lightbulb,
  MessageSquare,
  Globe,
} from "lucide-react";

interface InsightsResponse {
  success: boolean;
  insights: {
    websiteHealth: {
      summary: string;
      highlights: string[];
      trend: "up" | "down" | "stable";
    };
    aiChatInsights: {
      summary: string;
      popularTopics: string[];
      recommendations: string[];
    };
    actionItems: {
      urgent: string[];
      recommended: string[];
      opportunities: string[];
    };
  };
  generatedAt: string;
  error?: string;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")
    return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-zinc-400" />;
}

export function AIInsightsCard() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasFetched = useRef(false);

  const fetchInsights = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/insights");
      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || "Failed to fetch insights");
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load insights",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchInsights();
  }, [fetchInsights]);

  if (loading)
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-14 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Failed to load insights
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchInsights()}
            className="flex items-center gap-2 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/50"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );

  if (!data?.insights) return null;
  const { insights, generatedAt } = data;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              AI Insights
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Updated{" "}
              {new Date(generatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}{" "}
          Refresh
        </button>
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            <TrendIcon trend={insights.websiteHealth.trend} />
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              Website Health
            </h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {insights.websiteHealth.summary}
          </p>
          <ul className="space-y-2">
            {insights.websiteHealth.highlights.map((h, i) => (
              <li
                key={`health-${i}`}
                className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-500" />
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              AI Assistant
            </h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {insights.aiChatInsights.summary}
          </p>
          {insights.aiChatInsights.recommendations.length > 0 && (
            <ul className="space-y-2">
              {insights.aiChatInsights.recommendations.map((r, i) => (
                <li
                  key={`rec-${i}`}
                  className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              Action Items
            </h3>
          </div>
          {insights.actionItems.urgent.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                Urgent
              </p>
              {insights.actionItems.urgent.map((item, i) => (
                <div
                  key={`urgent-${i}`}
                  className="flex items-start gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
          {insights.actionItems.opportunities.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Opportunities
              </p>
              <ul className="space-y-1">
                {insights.actionItems.opportunities.map((item, i) => (
                  <li
                    key={`opp-${i}`}
                    className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
