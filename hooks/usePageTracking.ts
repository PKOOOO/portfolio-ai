"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("analytics_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", id);
  }
  return id;
}

export function usePageTracking() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    if (pathname.startsWith("/admin") || pathname.startsWith("/studio")) return;

    const sessionId = getSessionId();
    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        sessionId,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  }, [pathname]);
}
