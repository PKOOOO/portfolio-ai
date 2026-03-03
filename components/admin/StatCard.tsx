"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/50">
          <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        {change !== undefined && (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              change > 0
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                : change < 0
                  ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
            )}
          >
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {value}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
