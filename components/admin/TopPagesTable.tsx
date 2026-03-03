"use client";

interface TopPage {
  path: string;
  count: number;
}

export function TopPagesTable({ pages }: { pages: TopPage[] }) {
  const maxCount = Math.max(...pages.map((p) => p.count), 1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Top Pages
      </h3>
      {pages.length === 0 ? (
        <p className="text-sm text-zinc-400">No page data yet</p>
      ) : (
        <div className="space-y-3">
          {pages.map((page, i) => (
            <div key={page.path}>
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="w-4 text-xs font-medium text-zinc-400">
                    {i + 1}
                  </span>
                  {page.path}
                </span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {page.count} views
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{
                    width: `${(page.count / maxCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
