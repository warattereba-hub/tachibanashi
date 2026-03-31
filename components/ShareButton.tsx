"use client";

import { useState } from "react";

interface Props {
  title?: string;
  text?: string;
  url?: string;
}

export default function ShareButton({ title = "Tachibanashi", text, url: urlProp }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = urlProp ?? window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled — no-op
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs tracking-widest uppercase transition-opacity active:opacity-50"
      style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? "Copied" : "Share"}
    </button>
  );
}
