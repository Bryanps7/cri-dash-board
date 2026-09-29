import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-[var(--chart-1)]/15 text-[var(--chart-1)] border-[var(--chart-1)]/35",
  "bg-[var(--chart-2)]/15 text-[var(--chart-2)] border-[var(--chart-2)]/35",
  "bg-[var(--chart-3)]/15 text-[var(--chart-3)] border-[var(--chart-3)]/35",
  "bg-[var(--chart-4)]/15 text-[var(--chart-4)] border-[var(--chart-4)]/35",
  "bg-[var(--chart-5)]/15 text-[var(--chart-5)] border-[var(--chart-5)]/35",
];

export function statusIndex(status: string) {
  let hash = 0;
  for (const char of status.toLowerCase()) hash = (hash + char.charCodeAt(0)) % 997;
  return hash % PALETTE.length;
}

export function statusColorVar(status: string) {
  return `var(--chart-${statusIndex(status) + 1})`;
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        PALETTE[statusIndex(status)],
        className,
      )}
    >
      {status}
    </span>
  );
}
