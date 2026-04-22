"use client";

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from "react";
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
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-label)",
  fontSize: "0.65rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--color-sub)",
};

const SUBLABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.7rem",
  color: "var(--color-border)",
  marginTop: "0.25rem",
  lineHeight: 1.6,
};

async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&language=ja&country=JP&access_token=${token}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const feat = data.features?.[0];
    if (!feat) return null;
    const [lng, lat] = feat.geometry.coordinates;
    return { lat, lng };
  } catch {
    return null;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [preview, setPreview]   = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [tags, setTags]         = useState(["", "", ""]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [placeName, setPlaceName]     = useState("");
  const [location, setLocation]       = useState("");
  const [hookSentence, setHookSentence] = useState("");
  const [hostMessage, setHostMessage] = useState("");
  const [passphrase, setPassphrase]   = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");

  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!placeName.trim() || !location.trim() || !email.trim() || !password.trim()) {
      setError("場所名、住所、メールアドレス、パスワードは必須です");
      return;
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上で設定してください");
      return;
    }

    setLoading(true);
    try {
      const coords = await geocodeLocation(location);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          placeName: placeName.trim(),
          location: location.trim(),
          hookSentence: hookSentence.trim(),
          tags: tags.map((t) => t.trim()).filter(Boolean),
          hostMessage: hostMessage.trim(),
          passphrase: passphrase.trim(),
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登録に失敗しました");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }, []);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const setTag = (i: number, val: string) => {
    setTags((prev) => prev.map((t, idx) => (idx === i ? val : t)));
  };

  return (
    <div className="min-h-screen min-h-dvh" style={{ background: "var(--color-ink)" }}>
      <header className="flex items-center justify-between px-6 pt-8 pb-6">
        <Link
          href="/"
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
        >
          ← Map
        </Link>
        <div className="flex items-center gap-3">
          <span
            className="text-xs tracking-widest"
            style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
          >
            Host Registration
          </span>
          <Link
            href="/login"
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--color-border)", fontFamily: "var(--font-label)" }}
          >
            Login →
          </Link>
        </div>
      </header>

      <div className="px-6 pb-8">
        <h1
          className="text-2xl leading-snug"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-nari)" }}
        >
          あなたの場所を、<br />
          <span className="italic">Tachibanashi</span> に登録する。
        </h1>
        <div className="mt-3 h-px w-8" style={{ background: "var(--color-amber)" }} />
      </div>

      <form
        className="px-6 pb-16 flex flex-col gap-8"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Photo upload */}
        <div>
          <p style={LABEL_STYLE}>Photo</p>
          <p style={SUBLABEL_STYLE}>店または顔写真。なくても大丈夫です。</p>
          <div
            className="mt-2 relative flex flex-col items-center justify-center overflow-hidden"
            style={{
              height: 180,
              border: `1px ${dragging ? "solid" : "dashed"} ${dragging ? "var(--color-amber)" : "var(--color-border)"}`,
              borderRadius: 2,
              background: dragging ? "rgba(139,105,20,0.06)" : "var(--color-surface)",
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s",
            }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
          >
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={preview} alt="preview" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: 0.85 }} />
            ) : (
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1.2">
                  <rect x="3" y="3" width="18" height="18" rx="1" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span style={{ ...SUBLABEL_STYLE, marginTop: 0 }}>タップ、またはドロップ</span>
              </div>
            )}
            {preview && (
              <button
                type="button"
                className="absolute top-2 right-2 text-xs px-2 py-1"
                style={{
                  background: "rgba(26,21,16,0.8)",
                  color: "var(--color-sub)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 2,
                  fontFamily: "var(--font-label)",
                  letterSpacing: "0.1em",
                }}
                onClick={(e) => { e.stopPropagation(); setPreview(null); }}
              >
                変更
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>

        {/* Place name */}
        <Field label="Place Name" sublabel={null}>
          <input
            type="text"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="あなたの場所の名前"
            style={{ ...FIELD_STYLE, padding: "0.625rem 0.75rem" }}
          />
        </Field>

        {/* Location */}
        <Field label="Location" sublabel="Mapboxで自動的に地図上の座標を取得します">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例：岩手県一関市大手町"
            style={{ ...FIELD_STYLE, padding: "0.625rem 0.75rem" }}
          />
        </Field>

        {/* Hook sentence */}
        <Field
          label="あなたの場所にある、一番のガラクタは何ですか？"
          sublabel="事実と固有名詞だけで。形容詞はいりません。"
          prominent
        >
          <textarea
            rows={3}
            value={hookSentence}
            onChange={(e) => setHookSentence(e.target.value)}
            placeholder="例：一戸の川原で、2億年前の木が石になって拾える。"
            style={{ ...FIELD_STYLE, padding: "0.625rem 0.75rem", resize: "none", lineHeight: 1.8 }}
          />
        </Field>

        {/* Tags */}
        <div>
          <p style={LABEL_STYLE}>今、誰かに話したいことを3つまで</p>
          <div className="mt-2 flex flex-col gap-2">
            {tags.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ ...SUBLABEL_STYLE, marginTop: 0, minWidth: "1rem" }}>{i + 1}.</span>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setTag(i, e.target.value)}
                  placeholder={["例：化石・石ころ採集", "例：一関の食と酒", "例：地方で本屋をやること"][i]}
                  style={{ ...FIELD_STYLE, padding: "0.5rem 0.75rem" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Host message */}
        <Field label="お邪魔します、と言われたら何と返しますか？" sublabel="暖簾の裏に表示されます。">
          <textarea
            rows={3}
            value={hostMessage}
            onChange={(e) => setHostMessage(e.target.value)}
            placeholder="例：気軽にどうぞ。店にいます。"
            style={{ ...FIELD_STYLE, padding: "0.625rem 0.75rem", resize: "none", lineHeight: 1.8 }}
          />
        </Field>

        {/* Passphrase */}
        <Field
          label="合言葉（旅人だけに教える）"
          sublabel="プロフィールページで入力すると深い情報が解錠されます。ダッシュボードでいつでも変更できます。"
        >
          <input
            type="text"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="例：川の石"
            style={{ ...FIELD_STYLE, padding: "0.625rem 0.75rem" }}
          />
        </Field>

        {/* Divider */}
        <div className="h-px" style={{ background: "var(--color-border)" }} />

        {/* Account */}
        <div>
          <p style={LABEL_STYLE} className="mb-1">ログイン情報</p>
          <p style={SUBLABEL_STYLE}>ダッシュボードへのアクセスに使います。</p>
          <div className="mt-3 flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              style={{ ...FIELD_STYLE, padding: "0.625rem 0.75rem" }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード（6文字以上）"
              style={{ ...FIELD_STYLE, padding: "0.625rem 0.75rem" }}
            />
          </div>
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
          type="button"
          onClick={handleSubmit}
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
          {loading ? "登録中..." : "Tachibanashiに加わる"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label, sublabel, prominent = false, children,
}: {
  label: string; sublabel: string | null; prominent?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <p style={prominent ? { ...LABEL_STYLE, fontSize: "0.72rem", color: "var(--color-nari)" } : LABEL_STYLE}>
        {label}
      </p>
      {sublabel && <p style={SUBLABEL_STYLE}>{sublabel}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}
