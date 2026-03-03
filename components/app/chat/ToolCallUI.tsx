import { Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import type { ToolCallPart } from "./types";
import { getToolDisplayName } from "./utils";

interface ToolCallUIProps {
  toolPart: ToolCallPart;
  closeChat: () => void;
}

export function ToolCallUI({ toolPart }: ToolCallUIProps) {
  const toolName = toolPart.toolName || toolPart.type.replace("tool-", "");
  const displayName = getToolDisplayName(toolName);

  const isComplete =
    toolPart.state === "result" ||
    toolPart.result !== undefined ||
    toolPart.output !== undefined;

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm ${
            isComplete
              ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
              : "border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
          )}
          <div className="flex flex-col">
            <span
              className={`font-medium ${
                isComplete
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-blue-700 dark:text-blue-300"
              }`}
            >
              {isComplete ? `${displayName} complete` : `${displayName}...`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

