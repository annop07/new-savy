"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { useAuth } from "@/components/AuthProvider";
import { loginUser, registerUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = React.useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        full_name: form.full_name || undefined,
      });
      const res = await loginUser(form.email, form.password);
      await login(res.access_token);
      router.push("/user/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "ลงทะเบียนไม่สำเร็จ ลองใช้อีเมล/ชื่ออื่น");
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Savy</span>
          <span className="text-muted-foreground text-xs font-medium">AI</span>
        </Link>

        <Card>
          <CardContent className="py-6">
            <div className="mb-5 space-y-1 text-center">
              <h1 className="text-xl font-semibold">สร้างบัญชีใหม่</h1>
              <p className="text-muted-foreground text-sm">เริ่มให้ AI ช่วยดูแลการเงินของคุณ</p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive mb-4 rounded-md px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
                <Input id="full_name" value={form.full_name} onChange={set("full_name")} placeholder="สมชาย ใจดี" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  <Input id="username" value={form.username} onChange={set("username")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input id="email" type="email" value={form.email} onChange={set("email")} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input id="password" type="password" value={form.password} onChange={set("password")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">ยืนยันรหัสผ่าน</Label>
                <Input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} required />
              </div>
              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                ลงทะเบียน
              </Button>
            </form>

            <p className="text-muted-foreground mt-5 text-center text-sm">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/login" className="text-foreground font-medium hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
