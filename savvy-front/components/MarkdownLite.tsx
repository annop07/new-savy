import * as React from "react";

/**
 * A tiny, dependency-free Markdown renderer for AI answers.
 * Handles: #/##/### headings, **bold**, - / * / 1. lists, | tables |, paragraphs.
 * Builds React nodes (no dangerouslySetInnerHTML) so it's XSS-safe.
 */

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${keyBase}-b${i}`} className="font-semibold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyBase}-t${i}`}>{p}</React.Fragment>;
  });
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function MarkdownLite({ text }: { text: string }) {
  const lines = (text || "").replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let listBuf: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuf) return;
    const key = `list-${blocks.length}`;
    const items = listBuf.items.map((it, idx) => (
      <li key={`${key}-${idx}`} className="leading-relaxed">
        {renderInline(it, `${key}-${idx}`)}
      </li>
    ));
    blocks.push(
      listBuf.ordered ? (
        <ol key={key} className="ml-5 list-decimal space-y-1 text-sm">
          {items}
        </ol>
      ) : (
        <ul key={key} className="ml-5 list-disc space-y-1 text-sm">
          {items}
        </ul>
      )
    );
    listBuf = null;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table: a run of lines starting with |
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      const header = splitRow(tableLines[0]);
      const bodyRows = tableLines
        .slice(1)
        .filter((r) => !/^\|[\s:|-]+\|$/.test(r.trim()))
        .map(splitRow);
      const key = `table-${blocks.length}`;
      blocks.push(
        <div key={key} className="my-2 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {header.map((h, hi) => (
                  <th
                    key={hi}
                    className="text-muted-foreground px-3 py-2 text-left text-xs font-medium"
                  >
                    {renderInline(h, `${key}-h${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} className="border-t">
                  {row.map((c, ci) => (
                    <td key={ci} className="px-3 py-2">
                      {renderInline(c, `${key}-r${ri}c${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    const h = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      const content = renderInline(h[2], `h-${blocks.length}`);
      const cls =
        level === 1
          ? "mt-3 mb-1 text-base font-semibold"
          : level === 2
            ? "mt-3 mb-1 text-sm font-semibold"
            : "mt-2 mb-1 text-sm font-medium";
      blocks.push(
        <p key={`h-${blocks.length}`} className={cls}>
          {content}
        </p>
      );
      i++;
      continue;
    }

    // Lists
    const ul = trimmed.match(/^[-*]\s+(.*)$/);
    const ol = trimmed.match(/^\d+\.\s+(.*)$/);
    if (ul || ol) {
      const ordered = !!ol;
      const item = (ul ? ul[1] : ol![1]).trim();
      if (!listBuf || listBuf.ordered !== ordered) {
        flushList();
        listBuf = { ordered, items: [] };
      }
      listBuf.items.push(item);
      i++;
      continue;
    }

    // Blank line
    if (trimmed === "") {
      flushList();
      i++;
      continue;
    }

    // Paragraph
    flushList();
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-sm leading-relaxed">
        {renderInline(trimmed, `p-${blocks.length}`)}
      </p>
    );
    i++;
  }
  flushList();

  return <div className="space-y-2">{blocks}</div>;
}
