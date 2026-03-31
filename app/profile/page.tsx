import Link from "next/link";

const TAGS = [
  "化石・石ころ採集",
  "古本・リトルプレス",
  "一関の食と酒",
  "地方で本屋をやること",
  "川と水の記憶",
  "岩手の地名のはなし",
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-ink)" }}>
      {/* Photo area */}
      <div className="relative w-full" style={{ height: "52vw", maxHeight: 280, minHeight: 180 }}>
        <BookshelfSilhouette />
        {/* Top fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--color-ink))",
          }}
        />
        {/* Back button */}
        <Link
          href="/"
          className="absolute top-5 left-5 flex items-center gap-2 text-xs tracking-widest uppercase"
          style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
        >
          ← Map
        </Link>
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
        <p
          className="text-sm leading-[1.9] mb-8"
          style={{ color: "var(--color-sub)" }}
        >
          「一戸の川原で、2億年前の木が石になって拾える。」
        </p>

        {/* Tags section */}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Button */}
        <Link href="/ojama" className="block">
          <button
            className="w-full rounded-2xl py-4 text-sm tracking-widest transition-opacity active:opacity-70"
            style={{
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
      {/* Background */}
      <rect width="390" height="280" fill="#120f0b" />

      {/* Ambient light from above */}
      <ellipse cx="195" cy="-20" rx="160" ry="80" fill="#2a1f0a" opacity="0.4" />

      {/* Back wall shelves (far) */}
      <rect x="0" y="40" width="390" height="6" fill="#1e1810" />
      <rect x="0" y="110" width="390" height="6" fill="#1e1810" />
      <rect x="0" y="180" width="390" height="6" fill="#1e1810" />

      {/* Books row 1 — varied heights, tight packed */}
      {[
        { x: 8,   w: 14, h: 52, c: "#1c1508" },
        { x: 24,  w: 10, h: 44, c: "#231b0a" },
        { x: 36,  w: 16, h: 58, c: "#191208" },
        { x: 54,  w: 11, h: 48, c: "#2a1f0c" },
        { x: 67,  w: 13, h: 54, c: "#1e160a" },
        { x: 82,  w: 9,  h: 40, c: "#28190b" },
        { x: 93,  w: 15, h: 56, c: "#1a1208" },
        { x: 110, w: 10, h: 46, c: "#231a0a" },
        { x: 122, w: 14, h: 52, c: "#1d1509" },
        { x: 138, w: 12, h: 42, c: "#2b200d" },
        { x: 152, w: 16, h: 60, c: "#18110a" },
        { x: 170, w: 10, h: 44, c: "#261c0b" },
        { x: 182, w: 13, h: 50, c: "#1f160a" },
        { x: 197, w: 11, h: 56, c: "#221a0c" },
        { x: 210, w: 15, h: 48, c: "#1b1208" },
        { x: 227, w: 9,  h: 38, c: "#2a1e0d" },
        { x: 238, w: 14, h: 54, c: "#1c1409" },
        { x: 254, w: 12, h: 46, c: "#25190b" },
        { x: 268, w: 16, h: 60, c: "#191108" },
        { x: 286, w: 10, h: 44, c: "#271d0c" },
        { x: 298, w: 13, h: 52, c: "#1e160a" },
        { x: 313, w: 11, h: 42, c: "#231a0b" },
        { x: 326, w: 15, h: 56, c: "#1a1208" },
        { x: 343, w: 9,  h: 40, c: "#2c200d" },
        { x: 354, w: 14, h: 50, c: "#1d1509" },
        { x: 370, w: 12, h: 46, c: "#24180a" },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={46 - b.h} width={b.w} height={b.h} fill={b.c} rx="1" />
      ))}

      {/* Books row 2 */}
      {[
        { x: 5,   w: 13, h: 50, c: "#1b1308" },
        { x: 20,  w: 11, h: 44, c: "#241a0b" },
        { x: 33,  w: 16, h: 58, c: "#18110a" },
        { x: 51,  w: 10, h: 40, c: "#2b1f0c" },
        { x: 63,  w: 14, h: 54, c: "#1e150a" },
        { x: 79,  w: 9,  h: 46, c: "#27190b" },
        { x: 90,  w: 15, h: 60, c: "#1a1208" },
        { x: 107, w: 12, h: 42, c: "#231b0a" },
        { x: 121, w: 13, h: 52, c: "#1d1409" },
        { x: 136, w: 11, h: 48, c: "#2a1e0d" },
        { x: 149, w: 16, h: 56, c: "#191108" },
        { x: 167, w: 10, h: 44, c: "#261c0b" },
        { x: 179, w: 14, h: 58, c: "#1f160a" },
        { x: 195, w: 9,  h: 40, c: "#231a0c" },
        { x: 206, w: 13, h: 50, c: "#1c1308" },
        { x: 221, w: 15, h: 62, c: "#291e0b" },
        { x: 238, w: 11, h: 46, c: "#1b1209" },
        { x: 251, w: 14, h: 54, c: "#25190b" },
        { x: 267, w: 10, h: 44, c: "#1a1108" },
        { x: 279, w: 16, h: 60, c: "#271d0c" },
        { x: 297, w: 9,  h: 38, c: "#1e160a" },
        { x: 308, w: 13, h: 52, c: "#221a0b" },
        { x: 323, w: 11, h: 46, c: "#1b1208" },
        { x: 336, w: 15, h: 58, c: "#2c200d" },
        { x: 353, w: 10, h: 42, c: "#1d1509" },
        { x: 365, w: 14, h: 54, c: "#241800" },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={116 - b.h} width={b.w} height={b.h} fill={b.c} rx="1" />
      ))}

      {/* Books row 3 */}
      {[
        { x: 10,  w: 14, h: 48, c: "#1c1409" },
        { x: 26,  w: 10, h: 56, c: "#23190a" },
        { x: 38,  w: 15, h: 42, c: "#191108" },
        { x: 55,  w: 12, h: 60, c: "#2a1e0c" },
        { x: 69,  w: 9,  h: 44, c: "#1d150a" },
        { x: 80,  w: 16, h: 52, c: "#26180b" },
        { x: 98,  w: 11, h: 58, c: "#1a1208" },
        { x: 111, w: 13, h: 46, c: "#241b0a" },
        { x: 126, w: 10, h: 40, c: "#1e1509" },
        { x: 138, w: 15, h: 54, c: "#291e0d" },
        { x: 155, w: 12, h: 62, c: "#181008" },
        { x: 169, w: 14, h: 48, c: "#251b0b" },
        { x: 185, w: 9,  h: 44, c: "#1f160a" },
        { x: 196, w: 13, h: 56, c: "#22190c" },
        { x: 211, w: 16, h: 52, c: "#1b1208" },
        { x: 229, w: 10, h: 46, c: "#2b1f0b" },
        { x: 241, w: 14, h: 60, c: "#1c1409" },
        { x: 257, w: 11, h: 42, c: "#24180b" },
        { x: 270, w: 15, h: 54, c: "#1a1108" },
        { x: 287, w: 9,  h: 48, c: "#271c0c" },
        { x: 298, w: 13, h: 58, c: "#1d150a" },
        { x: 313, w: 12, h: 44, c: "#231a0b" },
        { x: 327, w: 16, h: 62, c: "#191108" },
        { x: 345, w: 10, h: 50, c: "#2c200d" },
        { x: 357, w: 14, h: 46, c: "#1e1509" },
        { x: 373, w: 11, h: 54, c: "#25190a" },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={186 - b.h} width={b.w} height={b.h} fill={b.c} rx="1" />
      ))}

      {/* Floor shadow */}
      <rect x="0" y="220" width="390" height="60" fill="#0e0b08" />

      {/* Foreground counter/desk silhouette */}
      <rect x="0" y="240" width="390" height="40" fill="#0a0806" />
      <rect x="30" y="230" width="160" height="15" rx="2" fill="#0d0a07" />

      {/* Warm lamp glow spots */}
      <ellipse cx="80" cy="40" rx="30" ry="15" fill="#8b6914" opacity="0.06" />
      <ellipse cx="200" cy="40" rx="30" ry="15" fill="#8b6914" opacity="0.06" />
      <ellipse cx="320" cy="40" rx="30" ry="15" fill="#8b6914" opacity="0.06" />

      {/* Top gradient overlay */}
      <rect
        x="0" y="0" width="390" height="280"
        fill="url(#photoOverlay)"
      />
      <defs>
        <linearGradient id="photoOverlay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1510" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#1a1510" stopOpacity="0" />
          <stop offset="100%" stopColor="#1a1510" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
