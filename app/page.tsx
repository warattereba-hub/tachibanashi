import Link from "next/link";

const PIN_X = 52; // % of viewport width
const PIN_Y = 48; // % of viewport height

export default function MapPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ink select-none">
      {/* SVG Map Background */}
      <MapBackground />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(15,11,8,0.7) 100%)",
        }}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-6 pt-8">
        <div>
          <h1
            className="text-sm tracking-widest text-nari"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
          >
            Tachibanashi
          </h1>
        </div>
        <div
          className="mt-1 rounded-full border px-3 py-1 text-xs tracking-widest uppercase"
          style={{
            borderColor: "var(--color-amber)",
            color: "var(--color-amber)",
            fontFamily: "var(--font-label)",
          }}
        >
          Iwate
        </div>
      </header>

      {/* Pin */}
      <Link
        href="/profile"
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        style={{ left: `${PIN_X}%`, top: `${PIN_Y}%` }}
        aria-label="店舗ピン"
      >
        {/* Ripple rings */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(139,105,20,0.25)",
            animation: "ripple 2.4s ease-out infinite",
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(139,105,20,0.15)",
            animation: "ripple 2.4s ease-out infinite 0.8s",
          }}
        />
        {/* Dot */}
        <span
          className="relative block h-4 w-4 rounded-full"
          style={{
            background: "var(--color-amber)",
            boxShadow: "0 0 12px 4px rgba(139,105,20,0.5)",
          }}
        />
      </Link>

      {/* Bottom Card */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-8">
        <Link href="/profile" className="block">
          <div
            className="p-5"
            style={{
              borderRadius: 2,
              background: "rgba(34,29,23,0.72)",
              border: "1px solid var(--color-border)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 -4px 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* Hook — largest, top */}
            <p
              className="mb-4 text-base leading-relaxed"
              style={{ color: "var(--color-nari)" }}
            >
              「一戸の川原で、2億年前の木が石になって拾える。」
            </p>

            {/* Location + Shop name — small, below hook */}
            <div className="flex items-baseline justify-between">
              <div>
                <p
                  className="text-xs tracking-[0.18em] uppercase"
                  style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
                >
                  岩手県 — 一関駅前
                </p>
                <h2
                  className="mt-0.5 text-sm italic"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-sub)" }}
                >
                  Tsugibooks
                </h2>
              </div>

              {/* Arrow — text only */}
              <span
                className="text-xl"
                style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
              >
                →
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Ripple keyframes */}
      <style>{`
        @keyframes ripple {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(4.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function MapBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base fill */}
      <rect width="390" height="844" fill="#1a1510" />

      {/* Water area */}
      <path
        d="M280 0 L390 0 L390 300 L320 400 L390 500 L390 844 L310 844 L290 700 L250 600 L270 450 L230 350 L260 200 Z"
        fill="#16130f"
        opacity="0.8"
      />

      {/* Large block areas (city blocks) */}
      <rect x="20" y="60" width="120" height="70" rx="2" fill="#201b15" />
      <rect x="160" y="40" width="90" height="55" rx="2" fill="#201b15" />
      <rect x="30" y="160" width="80" height="100" rx="2" fill="#201b15" />
      <rect x="130" y="150" width="110" height="80" rx="2" fill="#201b15" />
      <rect x="20" y="290" width="100" height="60" rx="2" fill="#201b15" />
      <rect x="140" y="270" width="85" height="90" rx="2" fill="#201b15" />
      <rect x="30" y="390" width="70" height="80" rx="2" fill="#201b15" />
      <rect x="120" y="380" width="100" height="65" rx="2" fill="#201b15" />
      <rect x="20" y="500" width="90" height="70" rx="2" fill="#201b15" />
      <rect x="130" y="490" width="75" height="90" rx="2" fill="#201b15" />
      <rect x="20" y="600" width="110" height="65" rx="2" fill="#201b15" />
      <rect x="150" y="610" width="80" height="75" rx="2" fill="#201b15" />
      <rect x="20" y="700" width="95" height="80" rx="2" fill="#201b15" />
      <rect x="135" y="720" width="90" height="60" rx="2" fill="#201b15" />

      {/* Main roads — horizontal */}
      <line x1="0" y1="140" x2="270" y2="140" stroke="#2a2318" strokeWidth="8" />
      <line x1="0" y1="260" x2="240" y2="260" stroke="#2a2318" strokeWidth="8" />
      <line x1="0" y1="370" x2="260" y2="370" stroke="#2a2318" strokeWidth="6" />
      <line x1="0" y1="480" x2="255" y2="480" stroke="#2a2318" strokeWidth="8" />
      <line x1="0" y1="590" x2="250" y2="590" stroke="#2a2318" strokeWidth="6" />
      <line x1="0" y1="700" x2="240" y2="700" stroke="#2a2318" strokeWidth="8" />

      {/* Main roads — vertical */}
      <line x1="110" y1="0" x2="110" y2="844" stroke="#2a2318" strokeWidth="8" />
      <line x1="240" y1="0" x2="240" y2="844" stroke="#2a2318" strokeWidth="6" />
      <line x1="50" y1="0" x2="50" y2="844" stroke="#2a2318" strokeWidth="5" />

      {/* Secondary roads */}
      <line x1="0" y1="200" x2="235" y2="200" stroke="#231e18" strokeWidth="3" />
      <line x1="0" y1="320" x2="230" y2="320" stroke="#231e18" strokeWidth="3" />
      <line x1="0" y1="430" x2="230" y2="430" stroke="#231e18" strokeWidth="3" />
      <line x1="0" y1="540" x2="235" y2="540" stroke="#231e18" strokeWidth="3" />
      <line x1="0" y1="650" x2="225" y2="650" stroke="#231e18" strokeWidth="3" />
      <line x1="175" y1="0" x2="175" y2="844" stroke="#231e18" strokeWidth="3" />
      <line x1="80" y1="0" x2="80" y2="844" stroke="#231e18" strokeWidth="2" />

      {/* Diagonal road */}
      <line x1="0" y1="400" x2="240" y2="180" stroke="#2a2318" strokeWidth="5" />
      <line x1="0" y1="580" x2="180" y2="380" stroke="#231e18" strokeWidth="3" />

      {/* Road labels (faint) */}
      <text x="115" y="256" fill="#3d3529" fontSize="7" fontFamily="sans-serif" transform="rotate(-90 115 256)">ICHINOSEKI-EKI</text>
      <text x="10" y="136" fill="#3d3529" fontSize="7" fontFamily="sans-serif">EKIMAE-DORI</text>

      {/* Subtle grid lines */}
      <line x1="0" y1="100" x2="390" y2="100" stroke="#1e1a14" strokeWidth="1" />
      <line x1="0" y1="450" x2="390" y2="450" stroke="#1e1a14" strokeWidth="1" />
      <line x1="0" y1="750" x2="390" y2="750" stroke="#1e1a14" strokeWidth="1" />
      <line x1="150" y1="0" x2="150" y2="844" stroke="#1e1a14" strokeWidth="1" />
      <line x1="300" y1="0" x2="300" y2="844" stroke="#1e1a14" strokeWidth="1" />
    </svg>
  );
}
