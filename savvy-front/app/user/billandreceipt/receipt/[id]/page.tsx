"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Loader2, ReceiptText } from "lucide-react";
import { toast } from "sonner";

import Template from "@/components/Template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories, getReceiptById, updateReceiptCategory } from "@/lib/api";
import { formatTHB, formatDate } from "@/lib/format";

interface Receipt {
  id: number;
  vendor_name: string;
  category_id: number | null;
  receipt_date: string;
  amount: number;
  currency: string;
  receipt_number: string | null;
  payment_method: string | null;
  notes: string | null;
  email_subject?: string;
  email_from?: string;
}
interface Category {
  id: number;
  name: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{value ?? "-"}</span>
    </div>
  );
}

export default function ReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cats, r] = await Promise.all([
          getCategories().catch(() => []),
          getReceiptById(parseInt(id)),
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setReceipt(r);
        if (r?.category_id) setSelected(r.category_id.toString());
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async () => {
    if (!selected || !receipt) return;
    setSaving(true);
    try {
      await updateReceiptCategory(receipt.id, parseInt(selected));
      setReceipt({ ...receipt, category_id: parseInt(selected) });
      toast.success("อัปเดตหมวดหมู่แล้ว");
    } catch {
      toast.error("อัปเดตไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Template>
      <Link
        href="/user/billandreceipt"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" /> กลับไปรายการใบเสร็จ
      </Link>

      {loading ? (
        <Card className="mx-auto max-w-xl">
          <CardContent className="space-y-3 py-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : !receipt ? (
        <p className="text-muted-foreground py-16 text-center">ไม่พบใบเสร็จ</p>
      ) : (
        <div className="mx-auto max-w-xl space-y-4">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-lg">
                    <ReceiptText className="size-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {receipt.vendor_name || "ไม่ระบุร้าน"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(receipt.receipt_date)}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight tabular-nums">
                  {formatTHB(receipt.amount)}
                </p>
              </div>

              <div className="divide-border mt-4 divide-y border-t pt-2">
                <Row label="ช่องทางชำระ" value={receipt.payment_method} />
                <Row label="เลขที่ใบเสร็จ" value={receipt.receipt_number} />
                <Row label="สกุลเงิน" value={receipt.currency} />
                {receipt.email_from && <Row label="อีเมลผู้ส่ง" value={receipt.email_from} />}
                {receipt.notes && <Row label="บันทึก" value={receipt.notes} />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pt-5">
              <CardTitle className="text-base">หมวดหมู่</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 pb-5">
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={save} disabled={saving || !selected} className="cursor-pointer">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                บันทึก
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Template>
  );
}
