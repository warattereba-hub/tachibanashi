"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ShareButton from "@/components/ShareButton";

interface HostData {
  id: string;
  placeName: string;
  location: string;
  hookSentence: string;
  tags: string[];
  hostMessage: string;
  passphrase: string;
  status: "active" | "rest";
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [host, setHost] = useState<HostData | null>(null);
  const [loading, setLoading] = useState(true);

  const [phraseInput, setPhraseInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    fetch(`/api/hosts/${id}`)
      .then((r) => r.json())
      .then((data) => setHost(data.host ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  const tryPassphrase = () => {
    if (!host?.passphrase) return;
    if (host.passphrase.trim().toLowerCase() === phraseInput.trim().toLowerCase()) {
      setUnlocked(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-ink)" }}>
        <p className="text-sm" style={{ color: "var(--color-border)", fontFamily: "var(--font-label)", letterSpacing: "0.15em" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (!host) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--color-ink)" }}>
        <p className="text-sm" style={{ color: "var(--color-sub)" }}>ホストが見つかりません</p>
        <Link href="/" className="text-xs tracking-widest uppercase" style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}>
          ← 地図へ
        </Link>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-ink)" }}>
      {/* Hero area */}
      <div className="relative w-full" style={{ height: "52vw", maxHeight: 280, minHeight: 180 }}>
        <BookshelfSilhouette />
        <div
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--color-ink))" }}
        />
        <Link
          href="/"
          className="absolute top-5 left-5 text-xs tracking-widest uppercase"
          style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
        >
          ← Map
        </Link>
        <div className="absolute top-5 right-5">
          <ShareButton title={host.placeName} text={host.hookSentence} url={shareUrl} />
        </div>
        {/* Status badge */}
        {host.status === "rest" && (
          <div
            className="absolute bottom-8 left-5 px-2 py-1 text-xs tracking-widest"
            style={{
              fontFamily: "var(--font-label)",
              color: "var(--color-border)",
              border: "1px solid var(--color-border)",
              borderRadius: 2,
              background: "rgba(46,37,25,0.7)",
            }}
          >
            休憩中
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-6 pb-10">
        <p
          className="text-xs tracking-[0.2em] uppercase mb-1"
          style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
        >
          {host.location}
        </p>
        <h1
          className="text-4xl italic mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-nari)" }}
        >
          {host.placeName}
        </h1>
        <div className="mb-5 h-px w-10" style={{ background: "var(--color-amber)" }} />

        {/* Hook */}
        {host.hookSentence && (
          <p className="text-sm leading-[1.9] mb-8" style={{ color: "var(--color-sub)" }}>
            「{host.hookSentence}」
          </p>
        )}

        {/* Tags */}
        {host.tags?.length > 0 && (
          <div className="mb-8">
            <p
              className="text-xs tracking-[0.2em] uppercase mb-3"
              style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
            >
              今、話したいこと
            </p>
            <div className="flex flex-wrap gap-2">
              {host.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs"
                  style={{
                    border: "1px solid var(--color-border)",
                    color: "var(--color-sub)",
                    background: "var(--color-surface)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Passphrase section */}
        {host.passphrase && !unlocked ? (
          <div
            className="mb-8 p-4"
            style={{ border: "1px solid var(--color-border)", borderRadius: 2, background: "var(--color-surface)" }}
          >
            <p
              className="text-xs tracking-[0.18em] uppercase mb-2"
              style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
            >
              合言葉を知っていますか？
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--color-border)" }}>
              ホストから合言葉を聞いていたら入力してください。
            </p>
            <div
              className="flex gap-2"
              style={{ animation: shake ? "shake 0.4s ease" : "none" }}
            >
              <input
                type="text"
                value={phraseInput}
                onChange={(e) => setPhraseInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && tryPassphrase()}
                placeholder="合言葉"
                className="flex-1 px-3 py-2 text-sm"
                style={{
                  background: "var(--color-ink)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 2,
                  color: "var(--color-nari)",
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                }}
              />
              <button
                onClick={tryPassphrase}
                className="px-4 py-2 text-xs tracking-widest transition-opacity active:opacity-60"
                style={{
                  borderRadius: 2,
                  border: "1px solid var(--color-amber)",
                  color: "var(--color-amber)",
                  fontFamily: "var(--font-label)",
                  background: "transparent",
                }}
              >
                解錠
              </button>
            </div>
          </div>
        ) : unlocked ? (
          <div
            className="mb-8 p-4"
            style={{
              border: "1px solid var(--color-amber)",
              borderRadius: 2,
              background: "var(--color-surface)",
              animation: "fadeIn 0.6s ease",
            }}
          >
            <p
              className="text-xs tracking-[0.18em] uppercase mb-3"
              style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
            >
              ✦ 合言葉が一致しました
            </p>
            <p className="text-sm leading-[1.9]" style={{ color: "var(--color-sub)" }}>
              {host.hostMessage}
            </p>
          </div>
        ) : null}

        <div className="flex-1" />

        <Link href={`/ojama?hostId=${host.id}`} className="block mb-4">
          <button
            className="w-full py-4 text-sm tracking-widest transition-opacity active:opacity-70"
            style={{
              borderRadius: 2,
              background: "transparent",
              border: "1px solid var(--color-amber)",
              color: "var(--color-amber)",
              fontFamily: "var(--font-label)",
              letterSpacing: "0.15em",
            }}
          >
            お邪魔します、と伝える
          </button>
        </Link>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function BookshelfSilhouette() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 390 280"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="390" height="280" fill="#120f0b" />
      <ellipse cx="195" cy="-20" rx="160" ry="80" fill="#2a1f0a" opacity="0.4" />
      <rect x="0" y="40" width="390" height="6" fill="#1e1810" />
      <rect x="0" y="110" width="390" height="6" fill="#1e1810" />
      <rect x="0" y="180" width="390" height="6" fill="#1e1810" />
      {[
        { x: 8,   w: 14, h: 52, c: "#1c1508" },{ x: 24,  w: 10, h: 44, c: "#231b0a" },
        { x: 36,  w: 16, h: 58, c: "#191208" },{ x: 54,  w: 11, h: 48, c: "#2a1f0c" },
        { x: 67,  w: 13, h: 54, c: "#1e160a" },{ x: 82,  w: 9,  h: 40, c: "#28190b" },
        { x: 93,  w: 15, h: 56, c: "#1a1208" },{ x: 110, w: 10, h: 46, c: "#231a0a" },
        { x: 122, w: 14, h: 52, c: "#1d1509" },{ x: 138, w: 12, h: 42, c: "#2b200d" },
        { x: 152, w: 16, h: 60, c: "#18110a" },{ x: 170, w: 10, h: 44, c: "#261c0b" },
        { x: 182, w: 13, h: 50, c: "#1f160a" },{ x: 197, w: 11, h: 56, c: "#221a0c" },
        { x: 210, w: 15, h: 48, c: "#1b1208" },{ x: 227, w: 9,  h: 38, c: "#2a1e0d" },
        { x: 238, w: 14, h: 54, c: "#1c1409" },{ x: 254, w: 12, h: 46, c: "#25190b" },
        { x: 268, w: 16, h: 60, c: "#191108" },{ x: 286, w: 10, h: 44, c: "#271d0c" },
        { x: 298, w: 13, h: 52, c: "#1e160a" },{ x: 313, w: 11, h: 42, c: "#231a0b" },
        { x: 326, w: 15, h: 56, c: "#1a1208" },{ x: 343, w: 9,  h: 40, c: "#2c200d" },
        { x: 354, w: 14, h: 50, c: "#1d1509" },{ x: 370, w: 12, h: 46, c: "#24180a" },
      ].map((b, i) => <rect key={i} x={b.x} y={46-b.h} width={b.w} height={b.h} fill={b.c} rx="1" />)}
      <rect x="0" y="220" width="390" height="60" fill="#0e0b08" />
      <rect x="0" y="0" width="390" height="280" fill="url(#photoOverlay)" />
      <defs>
        <linearGradient id="photoOverlay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2e2519" stopOpacity="0.3" />
          <stop offset="70%"  stopColor="#2e2519" stopOpacity="0" />
          <stop offset="100%" stopColor="#2e2519" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
