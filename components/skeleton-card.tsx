import { cn } from "@/lib/utils";

type SkeletonCardProps = {
  hero?: boolean;
};

export function SkeletonCard({ hero = false }: SkeletonCardProps): JSX.Element {
  if (hero) {
    return (
      <div className="overflow-hidden rounded-3xl border border-border-light bg-background-light p-3 shadow-soft dark:border-[#1f2a40] dark:bg-[#10192c]">
        <div className="shimmer-bg mb-3 aspect-[16/10] w-full rounded-2xl bg-border-light/70 animate-shimmer dark:bg-[#1a263d]" />
        <div className="space-y-2">
          <div className="shimmer-bg h-3 w-20 rounded-full bg-border-light/70 animate-shimmer dark:bg-[#1a263d]" />
          <div className="shimmer-bg h-5 w-full rounded-full bg-border-light/70 animate-shimmer dark:bg-[#1a263d]" />
          <div className="shimmer-bg h-5 w-4/5 rounded-full bg-border-light/70 animate-shimmer dark:bg-[#1a263d]" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border-light bg-background-light p-4 shadow-soft dark:border-[#1f2a40] dark:bg-[#10192c]">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="shimmer-bg h-3 w-24 rounded-full bg-border-light/70 animate-shimmer dark:bg-[#1a263d]" />
          <div className="shimmer-bg h-4 w-full rounded-full bg-border-light/70 animate-shimmer dark:bg-[#1a263d]" />
          <div className="shimmer-bg h-4 w-11/12 rounded-full bg-border-light/70 animate-shimmer dark:bg-[#1a263d]" />
          <div className="shimmer-bg h-3 w-1/2 rounded-full bg-border-light/70 animate-shimmer dark:bg-[#1a263d]" />
        </div>
        <div className="shimmer-bg h-[92px] w-[108px] rounded-2xl bg-border-light/70 animate-shimmer dark:bg-[#1a263d]" />
      </div>
    </div>
  );
}
