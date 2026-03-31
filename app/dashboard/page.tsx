"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const FIELD_STYLE: React.CSSProperties = {
  background: "var(--color-ink)",
  border: "1px solid var(--color-border)",
  color: "var(--color-nari)",
  borderRadius: 2,
  fontFamily: "var(--font-sans)",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
  padding: "0.625rem 0.75rem",
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-label)",
  fontSize: "0.65rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: "var(--color-sub)",
};

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="px-4 py-2 text-xs tracking-widest transition-all active:opacity-60 disabled:opacity-40"
      style={{
        borderRadius: 2,
        border: `1px solid ${saved ? "var(--color-amber)" : "var(--color-border)"}`,
        color: saved ? "var(--color-amber)" : "var(--color-sub)",
        fontFamily: "var(--font-label)",
        background: "transparent",
        transition: "border-color 0.3s, color 0.3s",
        whiteSpace: "nowrap",
      }}
    >
      {saving ? "..." : saved ? "保存済" : "更新"}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [host, setHost] = useState<HostData | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [hookSentence, setHookSentence] = useState("");
  const [tags, setTags] = useState(["", "", ""]);
  const [hostMessage, setHostMessage] = useState("");
  const [passphrase, setPassphrase] = useState("");

  // Save states
  const [savingHook, setSavingHook] = useState(false);
  const [savedHook, setSavedHook] = useState(false);
  const [savingTags, setSavingTags] = useState(false);
  const [savedTags, setSavedTags] = useState(false);
  const [savingMsg, setSavingMsg] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [savingPhrase, setSavingPhrase] = useState(false);
  const [savedPhrase, setSavedPhrase] = useState(false);

  useEffect(() => {
    fetch("/api/hosts/me")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const h: HostData = data.host;
        setHost(h);
        setHookSentence(h.hookSentence ?? "");
        const t = [...(h.tags ?? [])];
        while (t.length < 3) t.push("");
        setTags(t.slice(0, 3));
        setHostMessage(h.hostMessage ?? "");
        setPassphrase(h.passphrase ?? "");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const patch = async (body: object) => {
    const res = await fetch("/api/hosts/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const toggleStatus = async () => {
    if (!host) return;
    const next = host.status === "active" ? "rest" : "active";
    await patch({ status: next });
    setHost((h) => h ? { ...h, status: next } : h);
  };

  const saveWith = async <T,>(
    fn: () => Promise<T>,
    setSaving: (b: boolean) => void,
    setSaved: (b: boolean) => void
  ) => {
    setSaving(true);
    try {
      await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
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

  if (!host) return null;

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/${host.id}`
    : "";

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ink)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-6">
        <Link
          href="/"
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
        >
          ← Map
        </Link>
        <div className="flex items-center gap-3">
          <ShareButton title={host.placeName} url={profileUrl} />
          <button
            onClick={handleLogout}
            className="text-xs tracking-widest uppercase transition-opacity active:opacity-50"
            style={{ color: "var(--color-border)", fontFamily: "var(--font-label)" }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Title */}
      <div className="px-6 pb-6">
        <p
          className="text-xs tracking-[0.2em] uppercase mb-1"
          style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
        >
          {host.location}
        </p>
        <h1
          className="text-3xl italic mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-nari)" }}
        >
          {host.placeName}
        </h1>
        <div className="h-px w-8" style={{ background: "var(--color-amber)" }} />
      </div>

      <div className="px-6 pb-16 flex flex-col gap-6">

        {/* ── 1. オン/オフ切り替え ── */}
        <section
          className="p-5"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 2,
            background: "var(--color-surface)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={LABEL_STYLE}>今日の状態</p>
              <p
                className="mt-1 text-base"
                style={{
                  color: host.status === "active" ? "var(--color-amber)" : "var(--color-border)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {host.status === "active" ? "今日は話せる" : "休憩中"}
              </p>
            </div>
            <button
              onClick={toggleStatus}
              className="relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300"
              style={{
                background: host.status === "active" ? "var(--color-amber)" : "var(--color-border)",
                width: 52,
                height: 28,
              }}
              aria-label="ステータス切り替え"
            >
              <span
                className="inline-block rounded-full transition-transform duration-300"
                style={{
                  width: 20,
                  height: 20,
                  background: "var(--color-ink)",
                  transform: host.status === "active" ? "translateX(28px)" : "translateX(4px)",
                }}
              />
            </button>
          </div>
          <p
            className="mt-3 text-xs leading-relaxed"
            style={{ color: "var(--color-border)", fontFamily: "var(--font-sans)" }}
          >
            休憩中のときは地図のピンが半透明になります。
          </p>
        </section>

        {/* ── 2. 合言葉 ── */}
        <section
          className="p-5"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 2,
            background: "var(--color-surface)",
          }}
        >
          <p style={LABEL_STYLE} className="mb-3">今日の合言葉</p>
          <p
            className="text-xs mb-3 leading-relaxed"
            style={{ color: "var(--color-border)", fontFamily: "var(--font-sans)" }}
          >
            旅人がプロフィールページで入力すると深い情報が解錠されます。いつでも手動で変更できます。
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="例：川の石"
              style={FIELD_STYLE}
            />
            <SaveButton
              saving={savingPhrase}
              saved={savedPhrase}
              onClick={() => saveWith(() => patch({ passphrase }), setSavingPhrase, setSavedPhrase)}
            />
          </div>
        </section>

        {/* ── 3. フック一文 ── */}
        <section
          className="p-5"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 2,
            background: "var(--color-surface)",
          }}
        >
          <p style={LABEL_STYLE} className="mb-1">フック一文</p>
          <p
            className="text-xs mb-3 leading-relaxed"
            style={{ color: "var(--color-border)", fontFamily: "var(--font-sans)" }}
          >
            地図カードと旅人の最初の画面に表示されます。
          </p>
          <textarea
            rows={3}
            value={hookSentence}
            onChange={(e) => setHookSentence(e.target.value)}
            style={{ ...FIELD_STYLE, resize: "none", lineHeight: 1.8 }}
          />
          <div className="flex justify-end mt-2">
            <SaveButton
              saving={savingHook}
              saved={savedHook}
              onClick={() => saveWith(() => patch({ hookSentence }), setSavingHook, setSavedHook)}
            />
          </div>
        </section>

        {/* ── 4. タグ ── */}
        <section
          className="p-5"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 2,
            background: "var(--color-surface)",
          }}
        >
          <p style={LABEL_STYLE} className="mb-1">話したいことタグ</p>
          <p
            className="text-xs mb-3 leading-relaxed"
            style={{ color: "var(--color-border)", fontFamily: "var(--font-sans)" }}
          >
            プロフィールページに表示される3つのキーワード。
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-border)", minWidth: "1rem", fontFamily: "var(--font-label)" }}
                >
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTags((prev) => prev.map((t, idx) => (idx === i ? e.target.value : t)))}
                  style={{ ...FIELD_STYLE, padding: "0.5rem 0.75rem" }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <SaveButton
              saving={savingTags}
              saved={savedTags}
              onClick={() => saveWith(() => patch({ tags: tags.filter(Boolean) }), setSavingTags, setSavedTags)}
            />
          </div>
        </section>

        {/* ── 5. ホストメッセージ ── */}
        <section
          className="p-5"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 2,
            background: "var(--color-surface)",
          }}
        >
          <p style={LABEL_STYLE} className="mb-1">ホストメッセージ</p>
          <p
            className="text-xs mb-3 leading-relaxed"
            style={{ color: "var(--color-border)", fontFamily: "var(--font-sans)" }}
          >
            「お邪魔します」と伝えたときに暖簾の裏に表示されます。
          </p>
          <textarea
            rows={3}
            value={hostMessage}
            onChange={(e) => setHostMessage(e.target.value)}
            style={{ ...FIELD_STYLE, resize: "none", lineHeight: 1.8 }}
          />
          <div className="flex justify-end mt-2">
            <SaveButton
              saving={savingMsg}
              saved={savedMsg}
              onClick={() => saveWith(() => patch({ hostMessage }), setSavingMsg, setSavedMsg)}
            />
          </div>
        </section>

        {/* Profile link */}
        <div className="text-center">
          <Link
            href={`/profile/${host.id}`}
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
          >
            自分のプロフィールページを見る →
          </Link>
        </div>

      </div>
    </div>
  );
}
