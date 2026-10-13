import { Glitch } from "./glitch";

// Inline error for a failed screen query. The query cache already toasts with a Retry action.
export function LoadError({ children }: { children: string }) {
  return (
    <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
      <Glitch>{children}</Glitch>
    </p>
  );
}
