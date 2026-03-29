import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-input/50 bg-background px-4 py-2 text-base shadow-sm transition-all outline-none selection:bg-acm-blue/30 placeholder:text-muted-foreground/60 disabled:pointer-events-none disabled:opacity-50 md:text-sm dark:bg-input/20",
        "focus-visible:border-acm-blue focus-visible:ring-[3px] focus-visible:ring-acm-blue/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props} />
  );
}

export { Input }
