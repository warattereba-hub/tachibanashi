"use client";

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from "react";
import Link from "next/link";

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

export default function RegisterPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [tags, setTags] = useState(["", "", ""]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const setTag = (i: number, val: string) => {
    setTags((prev) => prev.map((t, idx) => (idx === i ? val : t)));
  };

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
        <span
          className="text-xs tracking-widest"
          style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
        >
          Host Registration
        </span>
      </header>

      {/* Title */}
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
        {/* 1. Photo upload */}
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
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt="preview"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: 0.85 }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1.2">
                  <rect x="3" y="3" width="18" height="18" rx="1" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span style={{ ...SUBLABEL_STYLE, marginTop: 0 }}>
                  タップ、またはドロップ
                </span>
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* 2. Place name */}
        <Field label="Place Name" sublabel={null}>
          <input
            type="text"
            placeholder="あなたの場所の名前"
            style={{ ...FIELD_STYLE, padding: "0.625rem 0.75rem" }}
          />
        </Field>

        {/* 3. Location */}
        <Field label="Location" sublabel={null}>
          <input
            type="text"
            placeholder="都道府県と最寄り駅など"
            style={{ ...FIELD_STYLE, padding: "0.625rem 0.75rem" }}
          />
        </Field>

        {/* 4. Hook sentence */}
        <Field
          label="あなたの場所にある、一番のガラクタは何ですか？"
          sublabel="事実と固有名詞だけで。形容詞はいりません。"
          prominent
        >
          <textarea
            rows={3}
            placeholder="例：一戸の川原で、2億年前の木が石になって拾える。"
            style={{
              ...FIELD_STYLE,
              padding: "0.625rem 0.75rem",
              resize: "none",
              lineHeight: 1.8,
            }}
          />
        </Field>

        {/* 5. Tags */}
        <div>
          <p style={LABEL_STYLE}>今、誰かに話したいことを3つまで</p>
          <div className="mt-2 flex flex-col gap-2">
            {tags.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ ...SUBLABEL_STYLE, marginTop: 0, minWidth: "1rem" }}>
                  {i + 1}.
                </span>
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

        {/* 6. Host message */}
        <Field
          label="お邪魔します、と言われたら何と返しますか？"
          sublabel="暖簾の裏に表示されます。"
        >
          <textarea
            rows={3}
            placeholder="例：気軽にどうぞ。店にいます。"
            style={{
              ...FIELD_STYLE,
              padding: "0.625rem 0.75rem",
              resize: "none",
              lineHeight: 1.8,
            }}
          />
        </Field>

        {/* Divider */}
        <div className="h-px" style={{ background: "var(--color-border)" }} />

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 text-sm tracking-widest transition-opacity active:opacity-70"
          style={{
            borderRadius: 2,
            border: "1px solid var(--color-amber)",
            color: "var(--color-amber)",
            background: "transparent",
            fontFamily: "var(--font-label)",
            letterSpacing: "0.18em",
          }}
        >
          Tachibanashiに加わる
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  sublabel,
  prominent = false,
  children,
}: {
  label: string;
  sublabel: string | null;
  prominent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        style={
          prominent
            ? { ...LABEL_STYLE, fontSize: "0.72rem", color: "var(--color-nari)" }
            : LABEL_STYLE
        }
      >
        {label}
      </p>
      {sublabel && <p style={SUBLABEL_STYLE}>{sublabel}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}
