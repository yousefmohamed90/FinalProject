import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/40 px-8 py-16 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1.5 text-lg font-semibold">{title}</h3>
      {description && <p className="mb-5 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
