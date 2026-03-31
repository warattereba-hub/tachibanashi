"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FIELD_STYLE: React.CSSProperties = {
  background: "var(--color-surface)",
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
  display: "block",
  marginBottom: "0.375rem",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ログインに失敗しました");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-ink)" }}>
      <header className="flex items-center justify-between px-6 pt-8 pb-6">
        <Link
          href="/"
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
        >
          ← Map
        </Link>
        <span
          className="text-xs tracking-widest"
          style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
        >
          Host Login
        </span>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 pb-16">
        <div className="mb-8">
          <h1
            className="text-2xl leading-snug mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-nari)" }}
          >
            ホストとして<br />
            <span className="italic">ログイン</span>する。
          </h1>
          <div className="h-px w-8" style={{ background: "var(--color-amber)" }} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label style={LABEL_STYLE}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="登録したメールアドレス"
              required
              style={FIELD_STYLE}
            />
          </div>

          <div>
            <label style={LABEL_STYLE}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              style={FIELD_STYLE}
            />
          </div>

          {error && (
            <p
              className="text-xs py-2 px-3"
              style={{
                color: "#c9553a",
                border: "1px solid rgba(201,85,58,0.3)",
                borderRadius: 2,
                background: "rgba(201,85,58,0.08)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-sm tracking-widest transition-opacity active:opacity-70 disabled:opacity-40"
            style={{
              borderRadius: 2,
              border: "1px solid var(--color-amber)",
              color: "var(--color-amber)",
              background: "transparent",
              fontFamily: "var(--font-label)",
              letterSpacing: "0.18em",
            }}
          >
            {loading ? "..." : "ログイン"}
          </button>

          <div className="text-center">
            <Link
              href="/register"
              className="text-xs tracking-widest"
              style={{ color: "var(--color-border)", fontFamily: "var(--font-label)" }}
            >
              まだ登録していない方 →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
