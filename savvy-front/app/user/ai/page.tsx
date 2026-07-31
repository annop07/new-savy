"use client";

import { MessageSquareText, ScanLine, Sparkles } from "lucide-react";

import Template from "@/components/Template";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AskPanel } from "@/components/ai/AskPanel";
import { ScanPanel } from "@/components/ai/ScanPanel";
import { AdvisorPanel } from "@/components/ai/AdvisorPanel";

export default function AiHubPage() {
  return (
    <Template>
      <PageHeader
        title="ผู้ช่วยการเงิน AI"
        description="อ่านสลิปด้วย Vision LLM · ถามประวัติใช้จ่ายเป็นภาษาคน · ที่ปรึกษางบอัตโนมัติ"
      />

      <Tabs defaultValue="ask" className="gap-4">
        <TabsList>
          <TabsTrigger value="ask" className="cursor-pointer gap-1.5">
            <MessageSquareText className="size-4" /> ถาม Savy
          </TabsTrigger>
          <TabsTrigger value="scan" className="cursor-pointer gap-1.5">
            <ScanLine className="size-4" /> สแกนสลิป
          </TabsTrigger>
          <TabsTrigger value="advisor" className="cursor-pointer gap-1.5">
            <Sparkles className="size-4" /> ที่ปรึกษางบ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ask">
          <AskPanel />
        </TabsContent>
        <TabsContent value="scan">
          <ScanPanel />
        </TabsContent>
        <TabsContent value="advisor">
          <AdvisorPanel />
        </TabsContent>
      </Tabs>
    </Template>
  );
}
