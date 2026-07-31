"use client";

import * as React from "react";
import { Loader2, Sparkles, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MarkdownLite } from "@/components/MarkdownLite";
import { getAdvice, type AdvisorResponse } from "@/lib/ai";
import { UsageBadge } from "./UsageBadge";

const TOOL_LABELS: Record<string, string> = {
  get_today: "ดูวันที่",
  get_spending_summary: "สรุปการใช้จ่าย",
  get_monthly_breakdown: "แยกตามเดือน",
  get_budget_status: "สถานะงบ",
  search_receipts: "ค้นใบเสร็จ",
};

export function AdvisorPanel() {
  const [loading, setLoading] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [result, setResult] = React.useState<AdvisorResponse | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await getAdvice(question.trim() || undefined);
      setResult(res);
    } catch {
      toast.error("ขอคำแนะนำไม่สำเร็จ", { description: "เช็กว่า backend ทำงานอยู่" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 py-5">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Sparkles className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">ที่ปรึกษาการเงินอัจฉริยะ</p>
              <p className="text-muted-foreground text-sm">
                Agent จะดึงข้อมูลการใช้จ่ายและงบประมาณจริงของคุณผ่าน tools แล้วให้คำแนะนำ
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="เจาะจงได้ (ไม่บังคับ) เช่น 'ช่วยดูงบความบันเทิง'"
              onKeyDown={(e) => e.key === "Enter" && run()}
            />
            <Button onClick={run} disabled={loading} className="cursor-pointer sm:w-auto">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              รีวิว & แนะนำ
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Agent กำลังเรียกใช้เครื่องมือและวิเคราะห์…
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="space-y-4 py-5">
            {result.tool_calls.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                  <Wrench className="size-3" /> เครื่องมือที่ใช้:
                </span>
                {result.tool_calls.map((t, i) => (
                  <Badge key={i} variant="secondary">
                    {TOOL_LABELS[t.tool] ?? t.tool}
                  </Badge>
                ))}
              </div>
            )}

            <MarkdownLite text={result.answer} />

            <div className="flex items-center justify-between border-t pt-3">
              <Badge variant="secondary">{result.iterations} รอบการคิด</Badge>
              <UsageBadge usage={result.usage} model={result.model} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
