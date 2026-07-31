"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Receipt,
  ScanLine,
  TrendingUp,
  Wallet,
} from "lucide-react";

import Template from "@/components/Template";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  CategoryBreakdown,
  type CategoryRow,
} from "@/components/dashboard/CategoryBreakdown";
import { DashboardAdvisor } from "@/components/dashboard/DashboardAdvisor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAnalyticsSummary,
  getCategoryBreakdown,
  getReceipts,
} from "@/lib/api";
import { formatTHB, formatDate } from "@/lib/format";

interface Summary {
  total_expense: number;
  average_monthly: number;
  max_expense: number;
  receipt_count: number;
}
interface ReceiptRow {
  id: number;
  vendor_name: string | null;
  amount: number;
  receipt_date: string | null;
}

export default function DashboardPage() {
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [categories, setCategories] = React.useState<CategoryRow[]>([]);
  const [recent, setRecent] = React.useState<ReceiptRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [s, c, r] = await Promise.all([
          getAnalyticsSummary().catch(() => null),
          getCategoryBreakdown().catch(() => []),
          getReceipts({ limit: 6 }).catch(() => []),
        ]);
        if (s) setSummary(s);
        setCategories(Array.isArray(c) ? c : []);
        setRecent(Array.isArray(r) ? r : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const topCategory = categories[0]?.category_name;

  return (
    <Template>
      <PageHeader
        title="แดชบอร์ด"
        description="ภาพรวมการใช้จ่ายของคุณ"
        actions={
          <Button asChild className="cursor-pointer">
            <Link href="/user/ai">
              <ScanLine className="size-4" /> สแกนสลิป
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="ใช้จ่ายทั้งหมด"
          value={formatTHB(summary?.total_expense)}
          icon={Wallet}
          loading={loading}
          hint={topCategory ? `หมวดสูงสุด: ${topCategory}` : undefined}
        />
        <StatCard
          label="จำนวนใบเสร็จ"
          value={summary?.receipt_count ?? 0}
          icon={Receipt}
          loading={loading}
        />
        <StatCard
          label="เฉลี่ยต่อเดือน"
          value={formatTHB(summary?.average_monthly)}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          label="รายการสูงสุด"
          value={formatTHB(summary?.max_expense)}
          icon={ArrowUpRight}
          loading={loading}
          tone="negative"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <CategoryBreakdown rows={categories} loading={loading} />
        <DashboardAdvisor />
      </div>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center justify-between pt-5">
          <CardTitle className="text-base">ใบเสร็จล่าสุด</CardTitle>
          <Link
            href="/user/billandreceipt"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
          >
            ดูทั้งหมด <ArrowUpRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="pb-2">
          {loading ? (
            <div className="space-y-3 pb-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              ยังไม่มีใบเสร็จ — ลองสแกนสลิปในหน้าผู้ช่วย AI
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-full">
                      <Receipt className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {r.vendor_name || "ไม่ระบุร้าน"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(r.receipt_date)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatTHB(r.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </Template>
  );
}
