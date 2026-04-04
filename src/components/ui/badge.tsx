import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { getTagDef, getTagLabel, TAG_CATEGORY_STYLES } from "@/lib/tags";

type BadgeVariant = "emerald" | "slate" | "amber" | "red" | "blue" | "purple";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "slate", children, ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    slate:   "bg-slate-100 text-slate-600 border border-slate-200",
    amber:   "bg-amber-50 text-amber-700 border border-amber-200",
    red:     "bg-red-50 text-red-600 border border-red-200",
    blue:    "bg-blue-50 text-blue-700 border border-blue-200",
    purple:  "bg-purple-50 text-purple-700 border border-purple-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function TagBadge({ tag, lang = "it" }: { tag: string; lang?: string }) {
  const def = getTagDef(tag.toLowerCase().trim());

  if (def) {
    const label = getTagLabel(def, lang);
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
          TAG_CATEGORY_STYLES[def.category]
        )}
        title={def.category === "allergen" ? `Allergen: ${label}` : label}
      >
        <span>{def.icon}</span>
        <span>{label}</span>
      </span>
    );
  }

  // Tag non riconosciuto — fallback grigio
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <span>•</span>
      <span>{tag}</span>
    </span>
  );
}
