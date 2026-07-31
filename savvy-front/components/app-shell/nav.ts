import {
  LayoutDashboard,
  Sparkles,
  ReceiptText,
  Wallet,
  Mail,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "แดชบอร์ด", href: "/user/dashboard", icon: LayoutDashboard },
  { label: "ผู้ช่วย AI", href: "/user/ai", icon: Sparkles },
  { label: "บิลและใบเสร็จ", href: "/user/billandreceipt", icon: ReceiptText },
  { label: "งบประมาณ", href: "/user/budgetmanagement", icon: Wallet },
  { label: "จัดการอีเมล", href: "/user/mailmanagement", icon: Mail },
  { label: "ตั้งค่า", href: "/user/settings", icon: Settings },
];
