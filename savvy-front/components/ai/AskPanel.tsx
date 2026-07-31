"use client";

import * as React from "react";
import { Loader2, Search, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MarkdownLite } from "@/components/MarkdownLite";
import { askSavy, type AskResponse } from "@/lib/ai";
import { formatTHB, formatDate } from "@/lib/format";
import { UsageBadge } from "./UsageBadge";

const EXAMPLES = [
  "เดือนนี้ฉันใช้จ่ายหมวดไหนมากที่สุด",
  "ค่าความบันเทิงเดือนนี้เท่าไหร่ เกินงบไหม",
  "ล่าสุดจ่ายค่าอาหารที่ร้านไหน",
];

export function AskPanel() {
  const [question, setQuestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AskResponse | null>(null);

  const ask = async (q: string) => {
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await askSavy(query);
      setResult(res);
    } catch {
      toast.error("ถามไม่สำเร็จ", { description: "ตรวจสอบว่า backend ทำงานอยู่" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 py-5">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="ถามเกี่ยวกับการใช้จ่ายของคุณเป็นภาษาไทยได้เลย…"
            rows={3}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") ask(question);
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuestion(ex);
                    ask(ex);
                  }}
                  className="border-border text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
            <Button
              onClick={() => ask(question)}
              disabled={loading || !question.trim()}
              className="cursor-pointer"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              ถาม Savy
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
            <Loader2 className="size-4 animate-spin" />
            กำลังค้นประวัติใช้จ่ายและเรียบเรียงคำตอบ…
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="space-y-4 py-5">
            <MarkdownLite text={result.answer} />

            {result.sources?.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <Search className="size-3" />
                  ใบเสร็จที่เกี่ยวข้อง ({result.sources.length})
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.sources.map((s, i) => (
                    <div
                      key={i}
                      className="border-border flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {s.vendor_name || "ไม่ระบุร้าน"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(s.receipt_date)}
                          {s.category ? ` · ${s.category}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 font-medium">
                        {formatTHB(s.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <Badge variant="secondary">RAG · vector search</Badge>
              <UsageBadge usage={result.usage} model={result.model} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
