export function formatTHB(amount: number | null | undefined, opts?: { compact?: boolean }): string {
  const value = amount ?? 0;
  if (opts?.compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(n: number | null | undefined): string {
  return new Intl.NumberFormat("th-TH").format(n ?? 0);
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "-";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function initials(name?: string | null): string {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}
