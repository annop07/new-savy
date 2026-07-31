"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

import Template from "@/components/Template";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BudgetFormModal from "@/components/budget/BudgetFormModal";
import EditBudgetModal from "@/components/budget/EditBudgetModal";
import { getBudgetComparisons, deleteBudget } from "@/lib/api";
import { BudgetWithSpent } from "@/types/budget";
import { formatTHB } from "@/lib/format";
import { cn } from "@/lib/utils";

const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const barColor = (p: number) =>
  p < 60 ? "bg-positive" : p < 90 ? "bg-warning" : "bg-negative";
const badgeVariant = (p: number): "positive" | "warning" | "negative" =>
  p < 60 ? "positive" : p < 90 ? "warning" : "negative";

export default function BudgetManage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<BudgetWithSpent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<BudgetWithSpent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const d = await getBudgetComparisons(month, year);
      setData(Array.isArray(d) ? d : []);
    } catch {
      toast.error("ดึงข้อมูลงบประมาณไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const totalBudget = data.reduce((s, i) => s + i.amount, 0);
  const totalSpent = data.reduce((s, i) => s + i.spent, 0);
  const remaining = totalBudget - totalSpent;

  const doDelete = async (id: number) => {
    try {
      await deleteBudget(id);
      setConfirmDelete(null);
      toast.success("ลบงบประมาณแล้ว");
      fetchData();
    } catch {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <Template>
      <PageHeader
        title="การจัดการงบประมาณ"
        description="ตั้งและติดตามงบประมาณรายเดือนของคุณ"
        actions={
          <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
            <Plus className="size-4" /> ตั้งงบใหม่
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026, 2027].map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchData} className="cursor-pointer">
          <RefreshCw className={cn("size-4", loading && "animate-spin")} /> รีเฟรช
        </Button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="งบทั้งหมด" value={formatTHB(totalBudget)} icon={Wallet} loading={loading} />
        <StatCard label="ใช้ไปแล้ว" value={formatTHB(totalSpent)} icon={Wallet} loading={loading} />
        <StatCard
          label={remaining >= 0 ? "คงเหลือ" : "เกินงบ"}
          value={formatTHB(Math.abs(remaining))}
          icon={Wallet}
          loading={loading}
          tone={remaining >= 0 ? "positive" : "negative"}
        />
      </div>

      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" /> กำลังโหลด…
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
              <Wallet className="size-6" />
            </div>
            <div>
              <p className="font-medium">ยังไม่มีงบประมาณในเดือนนี้</p>
              <p className="text-muted-foreground mt-1 text-sm">
                ตั้งงบเพื่อให้ AI ช่วยเตือนเมื่อใช้จ่ายใกล้เกิน
              </p>
            </div>
            <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
              <Plus className="size-4" /> เพิ่มงบแรกของคุณ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-4 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.category_name}</p>
                    <p className="text-muted-foreground text-sm">
                      งบ {formatTHB(item.amount)}
                    </p>
                  </div>
                  <Badge variant={badgeVariant(item.percentage)}>
                    {item.percentage}%
                  </Badge>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">ใช้ไปแล้ว</span>
                    <span className="font-medium">{formatTHB(item.spent)}</span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className={cn("h-full rounded-full", barColor(item.percentage))}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setEditing(item)}
                  >
                    <Pencil className="size-3.5" /> แก้ไข
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive cursor-pointer"
                    onClick={() => setConfirmDelete(item.id)}
                  >
                    <Trash2 className="size-3.5" /> ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <CardContent className="space-y-4 py-6">
              <div>
                <p className="font-medium">ยืนยันการลบงบประมาณ</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  การกระทำนี้ย้อนกลับไม่ได้
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="cursor-pointer" onClick={() => setConfirmDelete(null)}>
                  ยกเลิก
                </Button>
                <Button variant="destructive" className="cursor-pointer" onClick={() => doDelete(confirmDelete)}>
                  <Trash2 className="size-4" /> ลบ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showAdd && (
        <BudgetFormModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={fetchData}
          currentMonth={month}
          currentYear={year}
        />
      )}
      {editing && (
        <EditBudgetModal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          onSuccess={fetchData}
          budget={editing}
        />
      )}
    </Template>
  );
}
