import { Cpu, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TokenUsage } from "@/lib/ai";

export function UsageBadge({
  usage,
  model,
}: {
  usage: TokenUsage;
  model?: string;
}) {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
      {model && (
        <Badge variant="muted" className="gap-1">
          <Cpu className="size-3" />
          {model}
        </Badge>
      )}
      <span className="inline-flex items-center gap-1">
        <Coins className="size-3" />
        {usage.total_tokens.toLocaleString()} tokens
      </span>
      <span>·</span>
      <span>{usage.llm_calls} LLM call{usage.llm_calls === 1 ? "" : "s"}</span>
    </div>
  );
}
