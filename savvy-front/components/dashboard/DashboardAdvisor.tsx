"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownLite } from "@/components/MarkdownLite";
import { getAdvice, type AdvisorResponse } from "@/lib/ai";

export function DashboardAdvisor() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AdvisorResponse | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      setResult(await getAdvice());
    } catch {
      /* handled by empty state */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between pt-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="text-primary size-4" /> ข้อมูลเชิงลึกจาก AI
        </CardTitle>
        <Link
          href="/user/ai"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          เปิดผู้ช่วย <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="pb-5">
        {!result && !loading && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-muted-foreground text-sm">
              ให้ Agent รีวิวการใช้จ่ายเดือนนี้เทียบกับงบ แล้วสรุปจุดที่ควรระวัง
            </p>
            <Button onClick={run} className="cursor-pointer">
              <Sparkles className="size-4" /> วิเคราะห์เดือนนี้
            </Button>
          </div>
        )}
        {loading && (
          <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
            <Loader2 className="size-4 animate-spin" /> กำลังวิเคราะห์…
          </div>
        )}
        {result && (
          <div className="max-h-80 overflow-y-auto pr-1">
            <MarkdownLite text={result.answer} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
