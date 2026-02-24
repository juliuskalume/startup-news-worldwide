export default function NotFound(): JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-3xl border border-border-light bg-background-light p-6 text-center shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
        <h1 className="text-xl font-semibold text-text-main dark:text-[#ebf2ff]">Article not found</h1>
        <p className="mt-2 text-sm text-text-muted dark:text-[#8ea6cf]">
          This article may have expired from cache. Try opening it again from the feed.
        </p>
      </section>
    </main>
  );
}
