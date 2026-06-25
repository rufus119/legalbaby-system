import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-700/50 bg-slate-900/70 px-3 py-1 text-xs text-text-secondary",
        className
      )}
      {...props}
    />
  );
}
