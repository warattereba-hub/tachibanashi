"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  getHostStatus, setHostStatus,
  getPassphrase, savePassphrase,
  verifyPassphrase, type HostStatus,
} from "@/lib/hostState";
import ShareButton from "@/components/ShareButton";

const TAGS = [
  "化石・石ころ採集",
  "古本・リトルプレス",
  "一関の食と酒",
  "地方で本屋をやること",
  "川と水の記憶",
  "岩手の地名のはなし",
];

export default function ProfilePage() {
  const [hostStatus, setStatus]         = useState<HostStatus>("active");
  const [showHostPanel, setHostPanel]   = useState(false);
  const [storedPhrase, setStoredPhrase] = useState<string | null>(null);
  const [editingPhrase, setEditingPhrase] = useState("");
  const [phraseSaved, setPhraseSaved]   = useState(false);

  // Passphrase unlock (visitor)
  const [phraseInput, setPhraseInput] = useState("");
  const [unlocked, setUnlocked]       = useState(false);
  const [shake, setShake]             = useState(false);

  useEffect(() => {
    setStatus(getHostStatus());
    const p = getPassphrase();
    setStoredPhrase(p);
    setEditingPhrase(p ?? "");
  }, []);

  const updatePhrase = () => {
    const trimmed = editingPhrase.trim();
    savePassphrase(trimmed);
    setStoredPhrase(trimmed || null);
    setPhraseSaved(true);
    setTimeout(() => setPhraseSaved(false), 2000);
  };

  const toggleStatus = () => {
    const next: HostStatus = hostStatus === "active" ? "rest" : "active";
    setStatus(next);
    setHostStatus(next);
  };

  const tryPassphrase = () => {
    if (verifyPassphrase(phraseInput)) {
      setUnlocked(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex flex-col" style={{ background: "var(--color-ink)" }}>
      {/* Photo area */}
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
          <ShareButton title="Tsugibooks — Tachibanashi" text="「一戸の川原で、2億年前の木が石になって拾える。」" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-6 pb-10">

        {/* Location */}
        <p
          className="text-xs tracking-[0.2em] uppercase mb-1"
          style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
        >
          岩手県 — 一関駅前
        </p>

        {/* Shop name */}
        <h1
          className="text-4xl italic mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-nari)" }}
        >
          Tsugibooks
        </h1>

        {/* Divider */}
        <div className="mb-5 h-px w-10" style={{ background: "var(--color-amber)" }} />

        {/* Hook */}
        <p className="text-sm leading-[1.9] mb-8" style={{ color: "var(--color-sub)" }}>
          「一戸の川原で、2億年前の木が石になって拾える。」
        </p>

        {/* Tags */}
        <div className="mb-8">
          <p
            className="text-xs tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
          >
            今、話したいこと
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
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

        {/* ── Passphrase section (visitor) ── */}
        {!unlocked ? (
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
        ) : (
          /* Unlocked deep info */
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
              川端の石を拾うとき、時間が巻き戻る感覚がある。
              2億年という単位は、もはや数字じゃなくて質感だ。
              店に来たら、ぜひ石を一緒に見てほしい。
            </p>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Button */}
        <Link href="/ojama" className="block mb-4">
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

        {/* ── Host controls (collapsible) ── */}
        <button
          onClick={() => setHostPanel((v) => !v)}
          className="text-xs tracking-widest uppercase text-center transition-opacity active:opacity-50"
          style={{ color: "var(--color-border)", fontFamily: "var(--font-label)" }}
        >
          {showHostPanel ? "▲ ホストパネルを閉じる" : "▼ ホストパネル"}
        </button>

        {showHostPanel && (
          <div
            className="mt-3 p-4"
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 2,
              background: "var(--color-surface)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            {/* Status toggle */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
                >
                  今日の状態
                </p>
                <p
                  className="mt-0.5 text-sm"
                  style={{ color: hostStatus === "active" ? "var(--color-amber)" : "var(--color-border)" }}
                >
                  {hostStatus === "active" ? "今日は話せる" : "今日は休憩中"}
                </p>
              </div>
              <button
                onClick={toggleStatus}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300"
                style={{
                  background: hostStatus === "active" ? "var(--color-amber)" : "var(--color-border)",
                }}
                aria-label="ステータス切り替え"
              >
                <span
                  className="inline-block h-4 w-4 rounded-full bg-ink transition-transform duration-300"
                  style={{ transform: hostStatus === "active" ? "translateX(24px)" : "translateX(4px)" }}
                />
              </button>
            </div>

            {/* Passphrase edit */}
            <div className="pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
              <p
                className="text-xs tracking-widest uppercase mb-2"
                style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
              >
                合言葉
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingPhrase}
                  onChange={(e) => setEditingPhrase(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && updatePhrase()}
                  placeholder="今日の合言葉を入力"
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
                  onClick={updatePhrase}
                  className="px-3 py-2 text-xs tracking-widest transition-opacity active:opacity-60"
                  style={{
                    borderRadius: 2,
                    border: `1px solid ${phraseSaved ? "var(--color-amber)" : "var(--color-border)"}`,
                    color: phraseSaved ? "var(--color-amber)" : "var(--color-sub)",
                    fontFamily: "var(--font-label)",
                    background: "transparent",
                    transition: "border-color 0.3s, color 0.3s",
                  }}
                >
                  {phraseSaved ? "保存済" : "更新"}
                </button>
              </div>
              {storedPhrase && (
                <p className="mt-1.5 text-xs" style={{ color: "var(--color-border)" }}>
                  現在: 「{storedPhrase}」
                </p>
              )}
            </div>
          </div>
        )}
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
      {[
        { x: 5,   w: 13, h: 50, c: "#1b1308" },{ x: 20,  w: 11, h: 44, c: "#241a0b" },
        { x: 33,  w: 16, h: 58, c: "#18110a" },{ x: 51,  w: 10, h: 40, c: "#2b1f0c" },
        { x: 63,  w: 14, h: 54, c: "#1e150a" },{ x: 79,  w: 9,  h: 46, c: "#27190b" },
        { x: 90,  w: 15, h: 60, c: "#1a1208" },{ x: 107, w: 12, h: 42, c: "#231b0a" },
        { x: 121, w: 13, h: 52, c: "#1d1409" },{ x: 136, w: 11, h: 48, c: "#2a1e0d" },
        { x: 149, w: 16, h: 56, c: "#191108" },{ x: 167, w: 10, h: 44, c: "#261c0b" },
        { x: 179, w: 14, h: 58, c: "#1f160a" },{ x: 195, w: 9,  h: 40, c: "#231a0c" },
        { x: 206, w: 13, h: 50, c: "#1c1308" },{ x: 221, w: 15, h: 62, c: "#291e0b" },
        { x: 238, w: 11, h: 46, c: "#1b1209" },{ x: 251, w: 14, h: 54, c: "#25190b" },
        { x: 267, w: 10, h: 44, c: "#1a1108" },{ x: 279, w: 16, h: 60, c: "#271d0c" },
        { x: 297, w: 9,  h: 38, c: "#1e160a" },{ x: 308, w: 13, h: 52, c: "#221a0b" },
        { x: 323, w: 11, h: 46, c: "#1b1208" },{ x: 336, w: 15, h: 58, c: "#2c200d" },
        { x: 353, w: 10, h: 42, c: "#1d1509" },{ x: 365, w: 14, h: 54, c: "#241800" },
      ].map((b, i) => <rect key={i} x={b.x} y={116-b.h} width={b.w} height={b.h} fill={b.c} rx="1" />)}
      {[
        { x: 10,  w: 14, h: 48, c: "#1c1409" },{ x: 26,  w: 10, h: 56, c: "#23190a" },
        { x: 38,  w: 15, h: 42, c: "#191108" },{ x: 55,  w: 12, h: 60, c: "#2a1e0c" },
        { x: 69,  w: 9,  h: 44, c: "#1d150a" },{ x: 80,  w: 16, h: 52, c: "#26180b" },
        { x: 98,  w: 11, h: 58, c: "#1a1208" },{ x: 111, w: 13, h: 46, c: "#241b0a" },
        { x: 126, w: 10, h: 40, c: "#1e1509" },{ x: 138, w: 15, h: 54, c: "#291e0d" },
        { x: 155, w: 12, h: 62, c: "#181008" },{ x: 169, w: 14, h: 48, c: "#251b0b" },
        { x: 185, w: 9,  h: 44, c: "#1f160a" },{ x: 196, w: 13, h: 56, c: "#22190c" },
        { x: 211, w: 16, h: 52, c: "#1b1208" },{ x: 229, w: 10, h: 46, c: "#2b1f0b" },
        { x: 241, w: 14, h: 60, c: "#1c1409" },{ x: 257, w: 11, h: 42, c: "#24180b" },
        { x: 270, w: 15, h: 54, c: "#1a1108" },{ x: 287, w: 9,  h: 48, c: "#271c0c" },
        { x: 298, w: 13, h: 58, c: "#1d150a" },{ x: 313, w: 12, h: 44, c: "#231a0b" },
        { x: 327, w: 16, h: 62, c: "#191108" },{ x: 345, w: 10, h: 50, c: "#2c200d" },
        { x: 357, w: 14, h: 46, c: "#1e1509" },{ x: 373, w: 11, h: 54, c: "#25190a" },
      ].map((b, i) => <rect key={i} x={b.x} y={186-b.h} width={b.w} height={b.h} fill={b.c} rx="1" />)}
      <rect x="0" y="220" width="390" height="60" fill="#0e0b08" />
      <rect x="0" y="240" width="390" height="40" fill="#0a0806" />
      <rect x="30" y="230" width="160" height="15" rx="2" fill="#0d0a07" />
      <ellipse cx="80"  cy="40" rx="30" ry="15" fill="#8b6914" opacity="0.06" />
      <ellipse cx="200" cy="40" rx="30" ry="15" fill="#8b6914" opacity="0.06" />
      <ellipse cx="320" cy="40" rx="30" ry="15" fill="#8b6914" opacity="0.06" />
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
