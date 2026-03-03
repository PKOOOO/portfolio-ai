import Link from "next/link";
import Markdown from "react-markdown";

interface MessageContentProps {
  content: string;
  closeChat: () => void;
  isUser: boolean;
}

export function MessageContent({
  content,
  closeChat,
  isUser,
}: MessageContentProps) {
  const handleCloseChat = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      closeChat();
    }
  };

  return (
    <Markdown
      components={{
        a: ({ href, children }) => {
          if (!href) return <span>{children}</span>;
          const isInternalLink = href.startsWith("/");
          if (isInternalLink) {
            return (
              <Link
                href={href}
                onClick={handleCloseChat}
                className="text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors dark:text-red-400 dark:hover:text-red-300"
              >
                {children}
              </Link>
            );
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors dark:text-red-400 dark:hover:text-red-300"
            >
              {children}
            </a>
          );
        },
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        h1: ({ children }) => (
          <h1 className="mb-2 text-lg font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 text-base font-bold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 text-sm font-semibold">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 ml-4 list-outside list-disc space-y-1">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 ml-4 list-outside list-decimal space-y-1">
            {children}
          </ol>
        ),
        li: ({ children }) => {
          if (!children || (typeof children === "string" && !children.trim())) {
            return null;
          }
          return <li className="pl-1">{children}</li>;
        },
        hr: () => (
          <hr className="my-4 border-zinc-200 dark:border-zinc-700" />
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                className={`rounded px-1 py-0.5 text-xs font-mono ${
                  isUser
                    ? "bg-zinc-700 text-zinc-200"
                    : "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                }`}
              >
                {children}
              </code>
            );
          }
          return <code className={className}>{children}</code>;
        },
        pre: ({ children }) => (
          <pre className="mb-2 overflow-x-auto rounded-lg bg-zinc-200 p-3 text-xs dark:bg-zinc-700">
            {children}
          </pre>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
      }}
    >
      {content}
    </Markdown>
  );
}

