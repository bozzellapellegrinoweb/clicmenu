import { cn } from "@/lib/utils";

export function Spinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div
      className={cn(
        "rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin",
        sizes[size],
        className
      )}
    />
  );
}
