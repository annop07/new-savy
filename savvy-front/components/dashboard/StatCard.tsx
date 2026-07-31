import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: string;
  loading?: boolean;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{label}</p>
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-md",
              tone === "positive" && "bg-positive/12 text-positive",
              tone === "negative" && "bg-negative/12 text-negative",
              tone === "default" && "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-8 w-28" />
        ) : (
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        )}
        {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
      </CardContent>
    </Card>
  );
}
