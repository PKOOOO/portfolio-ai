"use client";

import { useState, useEffect, useRef } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const chartConfig = {
  views: { label: "Page Views", color: "hsl(262, 83%, 58%)" },
  visitors: { label: "Visitors", color: "hsl(217, 91%, 60%)" },
} satisfies ChartConfig;

type TimeRange = "7d" | "30d" | "90d";

interface DataPoint {
  date: string;
  label: string;
  views: number;
  visitors: number;
}

const timeRangeLabels: Record<TimeRange, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
};

export function PageViewsChart() {
  const [range, setRange] = useState<TimeRange>("7d");
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const cache = useRef<
    Record<
      string,
      { data: DataPoint[]; totalViews: number; totalVisitors: number }
    >
  >({});

  useEffect(() => {
    if (cache.current[range]) {
      const cached = cache.current[range];
      setData(cached.data);
      setTotalViews(cached.totalViews);
      setTotalVisitors(cached.totalVisitors);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/admin/analytics/chart?range=${range}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.data);
          setTotalViews(result.totalViews);
          setTotalVisitors(result.totalVisitors);
          cache.current[range] = {
            data: result.data,
            totalViews: result.totalViews,
            totalVisitors: result.totalVisitors,
          };
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="col-span-full rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-6">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: chartConfig.views.color }}
              />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Page Views
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {loading ? "..." : totalViews.toLocaleString()}
            </p>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: chartConfig.visitors.color }}
              />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Visitors
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {loading ? "..." : totalVisitors.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {(Object.keys(timeRangeLabels) as TimeRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                range === r
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200",
              )}
            >
              {timeRangeLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-[250px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-[250px] w-full"
        >
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={chartConfig.views.color}
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.views.color}
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient
                id="visitorsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={chartConfig.visitors.color}
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.visitors.color}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{
                stroke: "hsl(262, 83%, 58%)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="views"
              name="views"
              type="monotone"
              fill="url(#viewsGradient)"
              stroke={chartConfig.views.color}
              strokeWidth={2}
            />
            <Area
              dataKey="visitors"
              name="visitors"
              type="monotone"
              fill="url(#visitorsGradient)"
              stroke={chartConfig.visitors.color}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
