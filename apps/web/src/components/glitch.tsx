import { cn } from "@kenpathlabs/ui/lib/utils";

// The reveal glitch, reused wherever something is wrong, broken or not real. Plays once, on mount.
// inline-block because transform does nothing on an inline box.
export function Glitch({ children, className }: { children: string; className?: string }) {
  return (
    <span data-text={children} className={cn("glitch inline-block", className)}>
      {children}
    </span>
  );
}
