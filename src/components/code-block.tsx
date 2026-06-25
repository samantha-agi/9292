"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";

type Props = {
  code: string;
  filename: string;
  downloadHref: string;
  language?: string;
};

/**
 * Minimal, dependency-free syntax tinting. We only highlight a few things
 * that read well in any theme: comments, strings, numbers, and a small set
 * of keywords. Everything else stays in the default foreground colour.
 *
 * The goal is "calm and readable", not "rainbow IDE".
 */
function tint(code: string, language: string): React.ReactNode {
  const lines = code.split("\n");
  return lines.map((line, idx) => {
    const parts: React.ReactNode[] = [];
    let rest = line;

    // Comment detection: # for toml/bash/python, // for ts (not used here)
    const commentToken =
      language === "toml" || language === "bash" || language === "python"
        ? "#"
        : null;

    if (commentToken) {
      const idx2 = rest.indexOf(commentToken);
      // crude: only treat as comment if at start or preceded by whitespace
      if (idx2 === 0 || (idx2 > 0 && /\s/.test(rest[idx2 - 1]))) {
        const before = rest.slice(0, idx2);
        const comment = rest.slice(idx2);
        parts.push(tintTokens(before, language, `${idx}-b`));
        parts.push(
          <span key={`${idx}-c`} className="text-muted-foreground/70 italic">
            {comment}
          </span>
        );
        return (
          <span key={idx} className="block">
            {parts}
          </span>
        );
      }
    }

    parts.push(tintTokens(rest, language, `${idx}-t`));
    return (
      <span key={idx} className="block">
        {parts}
      </span>
    );
  });
}

function tintTokens(text: string, language: string, keyPrefix: string): React.ReactNode {
  // Match strings ("..." or '...'), numbers, and a few keywords.
  const pattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|\b(?:true|false|null|def|class|if|else|elif|return|import|from|for|while|in|not|and|or|None|try|except|finally|with|as|pass|break|continue|lambda|yield|global|nonlocal|assert|raise|del|exec|print|set|copy)\b)/g;

  const out: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIdx) {
      out.push(text.slice(lastIdx, m.index));
    }
    const tok = m[0];
    let cls = "";
    if (tok.startsWith('"') || tok.startsWith("'")) {
      cls = "text-amber-600 dark:text-amber-400";
    } else if (/^\d/.test(tok)) {
      cls = "text-pink-600 dark:text-pink-400";
    } else {
      // keyword
      cls = "text-emerald-700 dark:text-emerald-400 font-medium";
    }
    out.push(
      <span key={`${keyPrefix}-${i++}`} className={cls}>
        {tok}
      </span>
    );
    lastIdx = m.index + tok.length;
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx));
  return out;
}

export function CodeBlock({ code, filename, downloadHref, language = "bash" }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-muted/30">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="truncate font-mono text-xs text-muted-foreground">
            {filename}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 font-mono text-xs">
            <a href={downloadHref} download>
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
          <CopyButton text={code} />
        </div>
      </div>
      {/* Code */}
      <div className="max-h-[28rem] overflow-auto">
        <pre className="m-0 p-4 text-[13px] leading-relaxed font-mono">
          <code className="block whitespace-pre">{tint(code, language)}</code>
        </pre>
      </div>
    </div>
  );
}
