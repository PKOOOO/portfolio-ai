"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Menu,
  X,
  ExternalLink,
  ArrowLeft,
  Shield,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSanityAuth } from "@/hooks/useSanityAuth";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
];

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, isAuthenticated } = useSanityAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/50">
              <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Sign in required
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You need to be signed into Sanity Studio to access the admin
              dashboard.
            </p>
            <Link
              href="/studio"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-blue-500 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Sign in via Studio <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="mt-4 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              &larr; Back to Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-600 to-blue-500">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Analytics
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-900",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
            <Link
              href="/admin"
              className="flex items-center gap-2"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-600 to-blue-500">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Analytics
              </span>
            </Link>
          </div>
          {user && (
            <div className="border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                Signed in as
              </p>
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {user.name || user.email}
              </p>
            </div>
          )}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-3 border-t border-zinc-200 px-3 py-4 dark:border-zinc-800">
            <Link
              href="/studio"
              target="_blank"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-between gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              Open Studio <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 px-3 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Site
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 pt-14 lg:ml-64 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
