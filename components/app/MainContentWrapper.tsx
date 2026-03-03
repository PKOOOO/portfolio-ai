"use client";

import { useIsChatOpen } from "@/lib/store/chat-store-provider";

export function MainContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useIsChatOpen();

  return (
    <div
      className={`flex min-h-screen flex-col transition-all duration-300 ${
        isOpen ? "xl:mr-[380px]" : ""
      }`}
    >
      {children}
    </div>
  );
}

