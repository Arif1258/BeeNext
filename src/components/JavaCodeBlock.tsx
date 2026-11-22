"use client";

import React, { useState } from "react";
import { Copy, Check, Lock } from "lucide-react";

interface JavaCodeBlockProps {
  code: string;
  isLocked?: boolean;
  onUnlockClick?: () => void;
  price?: number;
}

export default function JavaCodeBlock({
  code,
  isLocked = false,
  onUnlockClick,
  price,
}: JavaCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (isLocked || !code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLocked) {
    return (
      <div className="relative rounded-xl border border-neutral-800 bg-[#111111] p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10 border border-brand-red text-brand-red">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-white">Java Solution Protected</h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            This solution code is part of our verified premium roadmap. Unlock this problem to view the complete implementation.
          </p>
        </div>
        {onUnlockClick && (
          <button
            onClick={onUnlockClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold font-mono transition-all shadow-brand"
          >
            <span>Unlock Solution {price ? `(₹${price})` : ""}</span>
          </button>
        )}
      </div>
    );
  }

  // Tokenize and highlight Java syntax lines
  const lines = (code || "").split("\n");

  const highlightJavaTokens = (text: string) => {
    // If it's a comment
    const commentIndex = text.indexOf("//");
    if (commentIndex !== -1) {
      const codePart = text.slice(0, commentIndex);
      const commentPart = text.slice(commentIndex);
      return (
        <>
          {renderTokens(codePart)}
          <span className="text-neutral-500 italic">{commentPart}</span>
        </>
      );
    }
    return renderTokens(text);
  };

  const renderTokens = (str: string) => {
    // Split by words, quotes, numbers, symbols
    const parts = str.split(/("(?:\\.|[^"\\])*"|\b(?:public|private|protected|class|static|final|void|return|new|if|else|for|while|do|switch|case|break|continue|import|package|try|catch|finally|throw|throws|int|long|boolean|double|float|char|byte|short|null|true|false)\b|\b\d+\b)/g);

    const keywords = new Set([
      "public", "private", "protected", "class", "static", "final", "void",
      "return", "new", "if", "else", "for", "while", "do", "switch", "case",
      "break", "continue", "import", "package", "try", "catch", "finally", "throw", "throws"
    ]);

    const types = new Set(["int", "long", "boolean", "double", "float", "char", "byte", "short"]);
    const literals = new Set(["null", "true", "false"]);

    return parts.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('"') && part.endsWith('"')) {
        return <span key={i} className="text-emerald-400">{part}</span>;
      }
      if (keywords.has(part)) {
        return <span key={i} className="text-[#E52532] font-semibold">{part}</span>;
      }
      if (types.has(part)) {
        return <span key={i} className="text-sky-400 font-medium">{part}</span>;
      }
      if (literals.has(part)) {
        return <span key={i} className="text-amber-400 font-medium">{part}</span>;
      }
      if (/^\d+$/.test(part)) {
        return <span key={i} className="text-amber-400">{part}</span>;
      }
      return <span key={i} className="text-neutral-200">{part}</span>;
    });
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-[#111111] overflow-hidden shadow-inner">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181818] border-b border-neutral-800">
        <span className="text-[11px] font-mono text-neutral-400 font-semibold uppercase tracking-wider">Java</span>

        {/* Copy Code button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-neutral-800 hover:bg-brand-red text-neutral-200 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-white font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
        <pre className="table w-full">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03]">
                <td className="table-cell pr-4 select-none text-right text-neutral-600 text-[11px] w-8">
                  {idx + 1}
                </td>
                <td className="table-cell whitespace-pre font-mono">
                  {highlightJavaTokens(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </pre>
      </div>
    </div>
  );
}
