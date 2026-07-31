"use client";

import { useState } from "react";
import { Mail, Pencil, Plus, Tag, Trash2, X } from "lucide-react";

import Template from "@/components/Template";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailRule {
  id: number;
  title: string;
  sender: string;
  keywords: string[];
  category: string;
}

const CATEGORIES = ["ช้อปปิ้ง", "สาธารณูปโภค", "การเงิน", "อื่นๆ"];

export default function MailManagement() {
  const [rules, setRules] = useState<EmailRule[]>([
    { id: 1, title: "ใบเสร็จ Lazada", sender: "no-reply@lazada.co.th", keywords: ["ใบเสร็จ", "คำสั่งซื้อ"], category: "ช้อปปิ้ง" },
    { id: 2, title: "ค่าไฟฟ้า MEA", sender: "e-service@mea.or.th", keywords: ["ใบแจ้งหนี้", "ค่าไฟฟ้า"], category: "สาธารณูปโภค" },
    { id: 3, title: "ใบเสร็จ Shopee", sender: "no-reply@shopee.co.th", keywords: ["ยืนยันการชำระเงิน"], category: "ช้อปปิ้ง" },
  ]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", sender: "", keywords: "", category: "ช้อปปิ้ง" });

  const openNew = () => {
    setEditId(null);
    setForm({ title: "", sender: "", keywords: "", category: "ช้อปปิ้ง" });
    setOpen(true);
  };
  const openEdit = (r: EmailRule) => {
    setEditId(r.id);
    setForm({ title: r.title, sender: r.sender, keywords: r.keywords.join(", "), category: r.category });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = form.keywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (editId !== null) {
      setRules((rs) => rs.map((r) => (r.id === editId ? { ...r, ...form, keywords } : r)));
    } else {
      setRules((rs) => [...rs, { id: Math.max(0, ...rs.map((r) => r.id)) + 1, ...form, keywords }]);
    }
    setOpen(false);
  };

  return (
    <Template>
      <PageHeader
        title="จัดการอีเมล"
        description="กำหนดกฎการดึงใบเสร็จจากอีเมล (ผู้ส่ง + คำสำคัญ → หมวดหมู่)"
        actions={
          <Button onClick={openNew} className="cursor-pointer">
            <Plus className="size-4" /> กำหนดกฎใหม่
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rules.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-3 py-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-md">
                    <Mail className="size-4" />
                  </div>
                  <p className="font-medium">{r.title}</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Tag className="size-3" /> {r.category}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">ผู้ส่ง: {r.sender}</p>
              <div className="flex flex-wrap gap-1">
                {r.keywords.map((k, i) => (
                  <Badge key={i} variant="muted">
                    {k}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-end gap-1 border-t pt-3">
                <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => openEdit(r)}>
                  <Pencil className="size-3.5" /> แก้ไข
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive cursor-pointer"
                  onClick={() => setRules((rs) => rs.filter((x) => x.id !== r.id))}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardContent className="py-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-semibold">{editId !== null ? "แก้ไขกฎ" : "กำหนดกฎใหม่"}</p>
                <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => setOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">หัวข้อ</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender">อีเมลผู้ส่ง</Label>
                  <Input id="sender" type="email" value={form.sender} onChange={(e) => setForm((f) => ({ ...f, sender: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">คำสำคัญ (คั่นด้วยจุลภาค)</Label>
                  <Input id="keywords" value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="ใบเสร็จ, ยืนยันการชำระเงิน" required />
                </div>
                <div className="space-y-2">
                  <Label>หมวดหมู่</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button type="submit" className="cursor-pointer">
                    บันทึก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </Template>
  );
}
