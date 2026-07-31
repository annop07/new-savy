"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Mail, Plus, RefreshCw, Server, Tags } from "lucide-react";
import { toast } from "sonner";

import Template from "@/components/Template";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getImapSettings, getCategories, syncEmails, createImapSetting } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface ImapSetting {
  id: number;
  email: string;
  server: string;
  port: number;
  username: string;
  use_ssl: boolean;
  folder: string;
  last_sync: string | null;
}
interface Category {
  id: number;
  name: string;
  description?: string;
}

const PRESETS: Record<string, { server: string; port: string }> = {
  gmail: { server: "imap.gmail.com", port: "993" },
  outlook: { server: "outlook.office365.com", port: "993" },
  yahoo: { server: "imap.mail.yahoo.com", port: "993" },
};

export default function SettingsPage() {
  const [imap, setImap] = useState<ImapSetting[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sync, setSync] = useState({ daysBack: 30, limit: 50 });
  const [form, setForm] = useState({
    email: "",
    password: "",
    server: "",
    port: "993",
    username: "",
    use_ssl: true,
    folder: "INBOX",
  });

  useEffect(() => {
    (async () => {
      try {
        const [i, c] = await Promise.all([
          getImapSettings().catch(() => []),
          getCategories().catch(() => []),
        ]);
        setImap(Array.isArray(i) ? i : []);
        setCategories(Array.isArray(c) ? c : []);
        const saved = localStorage.getItem("syncSettings");
        if (saved) setSync(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSync = (next: typeof sync) => {
    setSync(next);
    localStorage.setItem("syncSettings", JSON.stringify(next));
  };

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createImapSetting({
        ...form,
        port: parseInt(form.port),
        username: form.username || form.email,
      });
      setImap((p) => [...p, res]);
      setForm({ email: "", password: "", server: "", port: "993", username: "", use_ssl: true, folder: "INBOX" });
      toast.success("เพิ่มบัญชีอีเมลแล้ว");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const doSync = async (id: number) => {
    setSyncing(id);
    try {
      await syncEmails(id, sync.daysBack, sync.limit);
      setImap((p) => p.map((x) => (x.id === id ? { ...x, last_sync: new Date().toISOString() } : x)));
      toast.success(`ซิงค์อีเมลเสร็จ (ย้อนหลัง ${sync.daysBack} วัน)`);
    } catch {
      toast.error("ซิงค์ไม่สำเร็จ");
    } finally {
      setSyncing(null);
    }
  };

  return (
    <Template>
      <PageHeader title="ตั้งค่า" description="เชื่อมต่ออีเมลและจัดการหมวดหมู่" />

      <Tabs defaultValue="email" className="gap-4">
        <TabsList>
          <TabsTrigger value="email" className="cursor-pointer gap-1.5">
            <Mail className="size-4" /> อีเมล (IMAP)
          </TabsTrigger>
          <TabsTrigger value="categories" className="cursor-pointer gap-1.5">
            <Tags className="size-4" /> หมวดหมู่
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          {/* Connected accounts */}
          <Card>
            <CardHeader className="pt-5">
              <CardTitle className="text-base">บัญชีที่เชื่อมต่อ</CardTitle>
              <CardDescription>ดึงใบเสร็จจากอีเมลอัตโนมัติผ่าน IMAP</CardDescription>
            </CardHeader>
            <CardContent className="pb-5">
              {loading ? (
                <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
                  <Loader2 className="size-4 animate-spin" /> กำลังโหลด…
                </div>
              ) : imap.length === 0 ? (
                <p className="text-muted-foreground py-4 text-sm">ยังไม่มีบัญชีอีเมล เพิ่มด้านล่างได้เลย</p>
              ) : (
                <ul className="divide-border divide-y">
                  {imap.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-full">
                          <Mail className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{a.email}</p>
                          <p className="text-muted-foreground text-xs">
                            {a.server} · ซิงค์ล่าสุด {a.last_sync ? formatDate(a.last_sync) : "ยังไม่เคย"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => doSync(a.id)}
                        disabled={syncing === a.id}
                      >
                        {syncing === a.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <RefreshCw className="size-4" />
                        )}
                        ซิงค์
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex flex-wrap items-end gap-4 border-t pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="daysBack">ย้อนหลัง (วัน)</Label>
                  <Input
                    id="daysBack"
                    type="number"
                    className="w-28"
                    value={sync.daysBack}
                    onChange={(e) => saveSync({ ...sync, daysBack: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="limit">จำนวนอีเมลสูงสุด</Label>
                  <Input
                    id="limit"
                    type="number"
                    className="w-28"
                    value={sync.limit}
                    onChange={(e) => saveSync({ ...sync, limit: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add account */}
          <Card>
            <CardHeader className="pt-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="size-4" /> เพิ่มบัญชีอีเมล
              </CardTitle>
              <CardDescription>ใช้รหัสผ่านแอป (App Password) สำหรับ Gmail/Outlook</CardDescription>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="mb-4 flex gap-2">
                {Object.keys(PRESETS).map((k) => (
                  <Button
                    key={k}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer capitalize"
                    onClick={() => setForm((f) => ({ ...f, ...PRESETS[k] }))}
                  >
                    <Server className="size-3.5" /> {k}
                  </Button>
                ))}
              </div>
              <form onSubmit={addAccount} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input id="email" type="email" required value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value, username: f.username || e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน / App Password</Label>
                  <Input id="password" type="password" required value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="server">เซิร์ฟเวอร์ IMAP</Label>
                  <Input id="server" required placeholder="imap.gmail.com" value={form.server}
                    onChange={(e) => setForm((f) => ({ ...f, server: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">พอร์ต</Label>
                  <Input id="port" value={form.port}
                    onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))} />
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
                  <Label htmlFor="ssl" className="cursor-pointer">ใช้ SSL/TLS</Label>
                  <Switch id="ssl" checked={form.use_ssl}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, use_ssl: v }))} />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={submitting} className="cursor-pointer">
                    {submitting && <Loader2 className="size-4 animate-spin" />}
                    บันทึกบัญชี
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="pt-5">
              <CardTitle className="text-base">หมวดหมู่ค่าใช้จ่าย</CardTitle>
              <CardDescription>หมวดหมู่ที่ใช้จัดกลุ่มใบเสร็จของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="pb-5">
              {loading ? (
                <Loader2 className="text-muted-foreground size-4 animate-spin" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Badge key={c.id} variant="secondary" className="px-3 py-1 text-sm">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Template>
  );
}
