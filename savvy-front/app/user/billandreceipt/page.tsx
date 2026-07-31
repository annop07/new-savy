"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, ScanLine, Search } from "lucide-react";

import Template from "@/components/Template";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/DatePicker";
import { getCategories, getReceipts } from "@/lib/api";
import { formatTHB, formatDate } from "@/lib/format";

interface Receipt {
  id: number;
  vendor_name: string;
  category_id: number | null;
  receipt_date: string;
  amount: number;
  currency: string;
  notes: string | null;
  email_subject?: string;
}
interface Category {
  id: number;
  name: string;
}

const catVariant = (name?: string) =>
  name === "ธนาคาร" ? "positive" : name === "ความบันเทิง" ? "warning" : "secondary";

export default function BillAndReceipt() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"date-desc" | "amount-desc">("date-desc");
  const [start, setStart] = useState<Date | undefined>();
  const [end, setEnd] = useState<Date | undefined>();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cats = await getCategories().catch(() => []);
        setCategories(Array.isArray(cats) ? cats : []);
        const params: any = { limit: 100 };
        if (start) params.start_date = format(start, "yyyy-MM-dd");
        if (end) params.end_date = format(end, "yyyy-MM-dd");
        const data = await getReceipts(params).catch(() => []);
        setReceipts(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [start, end]);

  const catName = (id: number | null) =>
    categories.find((c) => c.id === id)?.name ?? "ไม่ระบุ";

  const rows = useMemo(() => {
    let list = [...receipts];
    if (category !== "all")
      list = list.filter((r) => r.category_id === parseInt(category));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.vendor_name?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q) ||
          r.email_subject?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) =>
      sort === "amount-desc"
        ? b.amount - a.amount
        : new Date(b.receipt_date).getTime() - new Date(a.receipt_date).getTime()
    );
    return list;
  }, [receipts, category, search, sort]);

  return (
    <Template>
      <PageHeader
        title="บิลและใบเสร็จ"
        description={`ทั้งหมด ${receipts.length} รายการ`}
        actions={
          <Button asChild className="cursor-pointer">
            <Link href="/user/ai">
              <ScanLine className="size-4" /> สแกนสลิป
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาร้าน / รายละเอียด…"
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="lg:w-44">
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as any)}>
              <SelectTrigger className="lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">วันที่ล่าสุด</SelectItem>
                <SelectItem value="amount-desc">ราคาสูงสุด</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <DatePicker date={start} onSelect={setStart} label="ตั้งแต่วันที่" />
            <DatePicker date={end} onSelect={setEnd} label="ถึงวันที่" />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="py-2">
          {loading ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
              <Loader2 className="size-4 animate-spin" /> กำลังโหลด…
            </div>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              ไม่พบรายการ — ลองสแกนสลิปในหน้าผู้ช่วย AI
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>ร้าน / ผู้รับ</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead className="text-right">จำนวนเงิน</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(r.receipt_date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {r.vendor_name || "ไม่ระบุ"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={catVariant(catName(r.category_id))}>
                        {catName(r.category_id)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatTHB(r.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="cursor-pointer">
                        <Link href={`/user/billandreceipt/receipt/${r.id}`}>
                          รายละเอียด
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Template>
  );
}
