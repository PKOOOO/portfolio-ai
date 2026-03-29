"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import { useChatActions, useIsChatOpen } from "@/lib/store/chat-store-provider";

export function FloatingChatTrigger() {
  const { toggleChat } = useChatActions();
  const isOpen = useIsChatOpen();

  if (isOpen) return null;

  const buttonStyles = `relative flex h-16 w-16 items-center justify-center rounded-full 
    bg-gradient-to-br from-[#80569E] via-[#6A1383] to-[#38B6FF] 
    shadow-[0_0_40px_rgba(106,19,131,0.4)]
    transition-all duration-500 
    hover:scale-110 hover:rotate-12 
    hover:shadow-[0_0_60px_rgba(106,19,131,0.6)]`;

  return (
    <div className="group fixed bottom-6 right-6 z-50">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#80569E] to-[#38B6FF] opacity-20 blur-2xl animate-ping [animation-duration:2s]" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6A1383] to-[#38B6FF] opacity-30 blur-xl animate-pulse [animation-duration:3s]" />

      <div className="absolute -top-1 -right-1 z-10">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#38B6FF] to-[#6A1383] shadow-lg animate-bounce [animation-duration:2s]">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-full right-0 mb-2 scale-90 rounded-lg border border-white/40 bg-white/90 px-3 py-1.5 text-sm font-medium text-neutral-800 opacity-0 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-100 group-hover:opacity-100 dark:border-white/20 dark:bg-black/90 dark:text-neutral-200">
        Talk to me
        <div className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 border-b border-r border-white/40 bg-white/90 dark:border-white/20 dark:bg-black/90" />
      </div>

      <button
        type="button"
        onClick={toggleChat}
        className={buttonStyles}
        aria-label="Open portfolio chat"
      >
        <MessageSquare className="h-7 w-7 text-white transition-transform group-hover:scale-110" />
      </button>
    </div>
  );
}