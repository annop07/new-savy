"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Sparkles } from "lucide-react";

import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { NAV_ITEMS } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const current = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname?.startsWith(i.href + "/")
  );

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile nav */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="เมนู">
              <Menu className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Sparkles className="size-4" /> Savy AI
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NAV_ITEMS.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <h1 className="text-[15px] font-semibold tracking-tight">
          {current?.label ?? "Savy"}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "hover:bg-accent flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors outline-none"
              )}
            >
              <Avatar>
                <AvatarFallback className="uppercase">
                  {initials(user?.full_name || user?.username)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="truncate text-sm font-medium">
                  {user?.full_name || user?.username || "ผู้ใช้"}
                </span>
                <span className="text-muted-foreground truncate text-xs font-normal">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="size-4" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
