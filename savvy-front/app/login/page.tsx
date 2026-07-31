"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { useAuth } from "@/components/AuthProvider";
import { loginUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      await login(res.access_token);
      router.push("/user/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@savy.app");
    setPassword("demo1234");
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
              <h1 className="text-xl font-semibold">ยินดีต้อนรับกลับ</h1>
              <p className="text-muted-foreground text-sm">
                เข้าสู่ระบบเพื่อจัดการการเงินของคุณ
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive mb-4 rounded-md px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                เข้าสู่ระบบ
              </Button>
            </form>

            <button
              onClick={fillDemo}
              className="text-muted-foreground hover:text-foreground mt-3 w-full text-center text-xs"
            >
              ใช้บัญชีเดโม (demo@savy.app / demo1234)
            </button>

            <p className="text-muted-foreground mt-5 text-center text-sm">
              ยังไม่มีบัญชี?{" "}
              <Link href="/register" className="text-foreground font-medium hover:underline">
                ลงทะเบียน
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
