import { Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (message: { text: string }) => void;
  isSignedIn: boolean;
}

const suggestions = [
  "What skills do you specialize in?",
  "Tell me about your recent projects",
  "How can we work together?",
];

export function WelcomeScreen({
  onSuggestionClick,
}: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-[#80569E] to-[#38B6FF] opacity-20 blur-2xl" />
        <div className="relative rounded-full bg-zinc-100 p-4 dark:bg-zinc-900/50">
          <Sparkles className="h-8 w-8 text-[#38B6FF]" />
        </div>
      </div>
      <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        How can I help you today?
      </h3>
      <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Ask me about skills, experience, or projects in this portfolio.
      </p>

      <div className="mt-6 w-full max-w-sm">
        <div className="flex flex-col gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick({ text: suggestion })}
              className="rounded-full border border-[#38B6FF]/30 bg-[#38B6FF]/5 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-[#38B6FF]/50 hover:bg-[#38B6FF]/10 dark:border-[#38B6FF]/20 dark:bg-[#38B6FF]/10 dark:text-zinc-300 dark:hover:bg-[#38B6FF]/20"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

