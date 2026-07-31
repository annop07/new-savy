"use client";

import * as React from "react";
import Image from "next/image";
import { Check, ImageUp, Loader2, Save, ScanLine, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  extractReceiptImage,
  type ExtractedReceipt,
  type TokenUsage,
} from "@/lib/ai";
import { formatTHB, formatDate } from "@/lib/format";
import { UsageBadge } from "./UsageBadge";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium">{value ?? "-"}</p>
    </div>
  );
}

export function ScanPanel() {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [receipt, setReceipt] = React.useState<ExtractedReceipt | null>(null);
  const [meta, setMeta] = React.useState<{ model: string; usage: TokenUsage } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview(null);
    setFile(null);
    setReceipt(null);
    setMeta(null);
    setSaved(false);
  };

  const handleFile = async (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพ (png/jpg)");
      return;
    }
    reset();
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setLoading(true);
    try {
      const res = await extractReceiptImage(f, false);
      setReceipt(res.receipt);
      setMeta({ model: res.model, usage: res.usage });
    } catch {
      toast.error("อ่านสลิปไม่สำเร็จ", { description: "ลองรูปที่ชัดขึ้น หรือเช็ก backend" });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const res = await extractReceiptImage(file, true);
      setSaved(true);
      toast.success("บันทึกใบเสร็จแล้ว", {
        description: `#${res.saved_receipt_id} · ${res.receipt.vendor_name ?? ""}`,
      });
    } catch {
      toast.error("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Uploader */}
      <Card>
        <CardContent className="py-5">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className="border-border hover:border-ring/60 hover:bg-accent/40 relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors"
          >
            {preview ? (
              <>
                <Image
                  src={preview}
                  alt="สลิปที่อัปโหลด"
                  width={320}
                  height={320}
                  unoptimized
                  className="max-h-[240px] w-auto rounded-lg border object-contain"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                >
                  <X className="size-4" /> เลือกรูปใหม่
                </Button>
              </>
            ) : (
              <>
                <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                  <ImageUp className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">ลากสลิป/ใบเสร็จมาวาง หรือคลิกเพื่อเลือก</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    รองรับสลิปโอนเงิน (PromptPay/ธนาคาร) และใบเสร็จร้านค้า
                  </p>
                </div>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      <Card>
        <CardContent className="py-5">
          {!receipt && !loading && (
            <div className="text-muted-foreground flex min-h-[280px] flex-col items-center justify-center gap-2 text-center text-sm">
              <ScanLine className="size-8 opacity-50" />
              ผลการอ่านสลิปจะแสดงที่นี่
            </div>
          )}

          {loading && (
            <div className="text-muted-foreground flex min-h-[280px] flex-col items-center justify-center gap-2 text-sm">
              <Loader2 className="size-6 animate-spin" />
              Vision LLM กำลังอ่านสลิป…
            </div>
          )}

          {receipt && !loading && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">
                    {receipt.vendor_name || "ไม่ระบุร้าน"}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {formatTHB(receipt.amount)}
                  </p>
                </div>
                <Badge
                  variant={receipt.confidence >= 0.8 ? "positive" : "warning"}
                >
                  ความมั่นใจ {(receipt.confidence * 100).toFixed(0)}%
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="วันที่" value={formatDate(receipt.receipt_date)} />
                <Field label="ช่องทางชำระ" value={receipt.payment_method} />
                <Field label="หมวดหมู่ (AI)" value={receipt.category_hint} />
                <Field label="เลขอ้างอิง" value={receipt.receipt_number} />
              </div>

              {receipt.items.length > 0 && (
                <div className="space-y-1 border-t pt-3">
                  <p className="text-muted-foreground text-xs">รายการ</p>
                  {receipt.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {it.quantity}× {it.name}
                      </span>
                      <span>{formatTHB(it.total ?? it.unit_price ?? 0)}</span>
                    </div>
                  ))}
                </div>
              )}

              {receipt.notes && (
                <p className="text-muted-foreground border-t pt-3 text-xs whitespace-pre-wrap">
                  {receipt.notes}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 border-t pt-3">
                {meta && <UsageBadge usage={meta.usage} model={meta.model} />}
                <Button
                  onClick={save}
                  disabled={saving || saved}
                  className="cursor-pointer"
                >
                  {saved ? (
                    <Check className="size-4" />
                  ) : saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {saved ? "บันทึกแล้ว" : "บันทึกใบเสร็จ"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
