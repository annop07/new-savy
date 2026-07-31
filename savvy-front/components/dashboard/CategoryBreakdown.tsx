import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTHB } from "@/lib/format";

export interface CategoryRow {
  category_name: string;
  total: number;
  receipt_count: number;
  percentage: number;
}

export function CategoryBreakdown({
  rows,
  loading,
}: {
  rows: CategoryRow[];
  loading?: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <Card className="h-full">
      <CardHeader className="pt-5">
        <CardTitle className="text-base">การใช้จ่ายตามหมวดหมู่</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            ยังไม่มีข้อมูลการใช้จ่าย
          </p>
        ) : (
          rows.map((r) => (
            <div key={r.category_name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{r.category_name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatTHB(r.total)}
                </span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-foreground/80 h-full rounded-full"
                  style={{ width: `${Math.max(4, (r.total / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
