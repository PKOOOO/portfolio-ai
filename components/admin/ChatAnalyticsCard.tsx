"use client";

import { useState } from "react";
import {
  MessageSquare,
  Wrench,
  Clock,
  Hash,
  ChevronDown,
  User,
  Bot,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolDisplayNames: Record<string, string> = {
  getProfile: "Profile",
  getProjects: "Projects",
  getProjectDetails: "Project Details",
  getBlogPosts: "Blog Posts",
  getAchievements: "Achievements",
  getTestimonials: "Testimonials",
  getExperience: "Experience",
  getSkills: "Skills",
  getEducation: "Education",
  getCertifications: "Certifications",
  getServices: "Services",
};

interface ChatMessage {
  role: string;
  content: string;
}

interface RecentChat {
  firstMessage: string;
  messageCount: number;
  timestamp: string;
  messages?: ChatMessage[];
  toolsUsed?: string[];
}

interface ChatAnalyticsProps {
  totalSessions: number;
  topTools: { tool: string; count: number }[];
  recentChats: RecentChat[];
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function ConversationModal({
  chat,
  onClose,
}: {
  chat: RecentChat;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Conversation
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {chat.messageCount} messages &middot; {timeAgo(chat.timestamp)}
              {chat.toolsUsed && chat.toolsUsed.length > 0 && (
                <>
                  {" "}
                  &middot;{" "}
                  {chat.toolsUsed
                    .map((t) => toolDisplayNames[t] || t)
                    .join(", ")}
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {chat.messages && chat.messages.length > 0 ? (
            chat.messages.map((msg, i) => (
              <div
                key={`msg-${i}-${msg.role}`}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role !== "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Bot className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-purple-600 text-white dark:bg-purple-700"
                      : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
                  )}
                >
                  <p className="whitespace-pre-wrap">
                    {msg.content || "(empty)"}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <User className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-zinc-400">
              No message details available for this conversation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatAnalyticsCard({
  totalSessions,
  topTools,
  recentChats,
}: ChatAnalyticsProps) {
  const maxToolCount = Math.max(...topTools.map((t) => t.count), 1);
  const [selectedChat, setSelectedChat] = useState<RecentChat | null>(null);

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/50">
              <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              AI Chat Analytics
            </h3>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 dark:bg-purple-950/50">
            <Hash className="h-3 w-3 text-purple-500" />
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
              {totalSessions}
            </span>
            <span className="text-xs text-purple-500 dark:text-purple-400">
              sessions
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-zinc-400" />
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Tool Usage
              </p>
            </div>
            {topTools.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Wrench className="mb-2 h-8 w-8 text-zinc-200 dark:text-zinc-700" />
                <p className="text-sm text-zinc-400">No tools used yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topTools.slice(0, 6).map((t) => (
                  <div key={t.tool}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {toolDisplayNames[t.tool] || t.tool}
                      </span>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {t.count}&times;
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{
                          width: `${(t.count / maxToolCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Recent Conversations
              </p>
            </div>
            {recentChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-zinc-200 dark:text-zinc-700" />
                <p className="text-sm text-zinc-400">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentChats.slice(0, 5).map((chat, i) => (
                  <button
                    key={`chat-${i}-${chat.timestamp}`}
                    type="button"
                    onClick={() => setSelectedChat(chat)}
                    className="group w-full rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 text-left transition-all hover:border-purple-200 hover:bg-purple-50 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:border-purple-800 dark:hover:bg-purple-950/20"
                  >
                    <p className="line-clamp-1 text-sm font-medium text-zinc-700 group-hover:text-purple-700 dark:text-zinc-300 dark:group-hover:text-purple-300">
                      {chat.firstMessage || "General conversation"}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <MessageSquare className="h-3 w-3" />
                          {chat.messageCount} msgs
                        </span>
                        <span className="text-xs text-zinc-400">
                          {timeAgo(chat.timestamp)}
                        </span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-300 group-hover:text-purple-400 dark:text-zinc-600" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedChat && (
        <ConversationModal
          chat={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </>
  );
}
