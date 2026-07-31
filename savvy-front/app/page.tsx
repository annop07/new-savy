"use client";

import Link from "next/link";
import {
  ArrowRight,
  MessageSquareText,
  ScanLine,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ScanLine,
    title: "อ่านสลิปด้วย Vision AI",
    desc: "ถ่ายรูปสลิปโอนเงินหรือใบเสร็จ แล้ว AI แปลงเป็นข้อมูลให้อัตโนมัติ แม่นทั้งภาษาไทยและปีพุทธศักราช",
  },
  {
    icon: MessageSquareText,
    title: "ถามเป็นภาษาคน",
    desc: "“เดือนนี้ค่ากินเกินงบไหม?” ถามได้เลย ระบบค้นประวัติใช้จ่ายด้วย Vector Search แล้วตอบพร้อมหลักฐาน",
  },
  {
    icon: Sparkles,
    title: "ที่ปรึกษางบอัตโนมัติ",
    desc: "AI Agent ดึงข้อมูลจริงของคุณ วิเคราะห์พฤติกรรมการใช้เงิน และแนะนำการวางแผนงบให้ทันที",
  },
];

export default function Landing() {
  return (
    <div className="bg-background min-h-screen">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Savy</span>
            <span className="text-muted-foreground text-xs font-medium">AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="cursor-pointer">
              <Link href="/login">เข้าสู่ระบบ</Link>
            </Button>
            <Button asChild className="cursor-pointer">
              <Link href="/register">เริ่มใช้งาน</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:px-6">
        <div className="bg-muted text-muted-foreground mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <Sparkles className="size-3" /> ขับเคลื่อนด้วย Vision LLM · RAG · AI Agent
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
          ผู้ช่วยการเงินที่<span className="text-muted-foreground">อ่านสลิปแทนคุณ</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base text-pretty sm:text-lg">
          Savy เปลี่ยนสลิปโอนเงินและใบเสร็จให้เป็นข้อมูลการเงินที่ค้นหาได้ พร้อม AI
          ที่คอยวิเคราะห์งบและให้คำแนะนำแบบเรียลไทม์
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg" className="cursor-pointer">
            <Link href="/register">
              เริ่มใช้งานฟรี <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="cursor-pointer">
            <Link href="/login">ทดลองบัญชีเดโม</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent className="space-y-3 py-6">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row sm:px-6">
          <div className="flex items-center gap-1.5">
            <Wallet className="size-4" /> Savy — AI Financial Agent
          </div>
          <p className="text-xs">สร้างเพื่อพอร์ตโฟลิโอ AI Engineer</p>
        </div>
      </footer>
    </div>
  );
}
