import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl3 bg-card/95 shadow-soft transition-all",
        className
      )}
      {...props}
    />
  );
}
