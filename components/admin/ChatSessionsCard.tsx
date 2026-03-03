import { MessageSquare } from "lucide-react";

interface ConversationSummary {
  _id: string;
  email: string;
  sessionId: string;
  startedAt: string;
  lastMessageAt?: string;
  messageCount: number;
}

interface ChatSessionsCardProps {
  sessions: ConversationSummary[];
}

export function ChatSessionsCard({ sessions }: ChatSessionsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Recent AI Conversations
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Last {sessions.length} sessions from your portfolio chat
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <MessageSquare className="h-4 w-4" />
        </div>
      </div>
      {sessions.length === 0 ? (
        <p className="py-4 text-sm text-zinc-500 dark:text-zinc-400">
          No conversations found yet. Once people start chatting with your AI
          assistant, they&apos;ll appear here.
        </p>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => {
            const last = session.lastMessageAt || session.startedAt;
            const lastLabel = new Date(last).toLocaleString();
            return (
              <div
                key={session._id}
                className="flex items-start justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                    {session.email || "Unknown email"}
                  </p>
                  <p className="mt-0.5 truncate text-zinc-500 dark:text-zinc-400">
                    {session.messageCount} messages • {lastLabel}
                  </p>
                </div>
                <span className="ml-2 shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {session.sessionId.slice(0, 8)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

