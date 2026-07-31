"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r lg:flex">
      <div className="flex h-14 items-center gap-2 border-b px-5">
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
          <Sparkles className="size-4" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">Savy</span>
        <span className="text-muted-foreground text-[11px] font-medium">AI</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          ขับเคลื่อนด้วย Vision LLM · RAG · Agent
        </p>
      </div>
    </aside>
  );
}
