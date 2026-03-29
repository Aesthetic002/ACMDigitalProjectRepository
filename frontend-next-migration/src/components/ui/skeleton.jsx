import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-muted/50 dark:bg-accent/20", className)}
      {...props} />
  );
}

export { Skeleton }
