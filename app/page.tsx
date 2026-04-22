"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ShareButton from "@/components/ShareButton";

interface HostPin {
  id: string;
  placeName: string;
  location: string;
  hookSentence: string;
  status: "active" | "rest";
  lat: number | null;
  lng: number | null;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

// Tachibanashi custom dark style — parchment-meets-exploration
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

export default function MapPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [hosts, setHosts] = useState<HostPin[]>([]);
  const [selected, setSelected] = useState<HostPin | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Fetch hosts
  useEffect(() => {
    fetch("/api/hosts")
      .then((r) => r.json())
      .then((data) => {
        setHosts(data.hosts ?? []);
        if (data.hosts?.length > 0) setSelected(data.hosts[0]);
      })
      .catch(() => {});
  }, []);

  // Init Mapbox
  const initMap = useCallback(async () => {
    if (!mapContainer.current || mapRef.current) return;

    const container = mapContainer.current;

    // Wait until the container has a non-zero rendered size before creating the map.
    // If Map() runs while clientHeight === 0, the canvas is frozen at 300×150.
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      await new Promise<void>((resolve) => {
        const sizeObserver = new ResizeObserver((_, obs) => {
          if (container.clientWidth > 0 && container.clientHeight > 0) {
            obs.disconnect();
            resolve();
          }
        });
        sizeObserver.observe(container);
      });
    }

    if (!mapContainer.current || mapRef.current) return;

    const mapboxgl = (await import("mapbox-gl")).default;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Center on Iwate/Tohoku area by default
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [141.15, 39.1],
      zoom: 9,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.resize();
      setMapReady(true);
    });

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    const ro = new ResizeObserver(() => map.resize());
    if (mapContainer.current) ro.observe(mapContainer.current);

    mapRef.current = map;

    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    initMap();
  }, [initMap]);

  // Add/update markers when hosts or map are ready
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const loadMarkers = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const map = mapRef.current!;

      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const validHosts = hosts.filter((h) => h.lat !== null && h.lng !== null);

      if (validHosts.length === 0) return;

      // Fit bounds to all hosts
      if (validHosts.length === 1) {
        map.flyTo({ center: [validHosts[0].lng!, validHosts[0].lat!], zoom: 13 });
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        validHosts.forEach((h) => bounds.extend([h.lng!, h.lat!]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
      }

      // Create markers
      validHosts.forEach((host) => {
        const el = document.createElement("div");
        el.className = "tnsh-pin";
        el.style.cssText = `
          width: 16px; height: 16px; border-radius: 50%;
          background: #9b7520;
          box-shadow: 0 0 0 4px rgba(155,117,32,0.25);
          cursor: pointer;
          transition: opacity 0.4s;
          opacity: ${host.status === "rest" ? "0.28" : "1"};
          position: relative;
        `;

        if (host.status === "active") {
          const ripple = document.createElement("div");
          ripple.style.cssText = `
            position: absolute; inset: -8px; border-radius: 50%;
            background: rgba(155,117,32,0.2);
            animation: pin-ripple 2.4s ease-out infinite;
          `;
          el.appendChild(ripple);
        }

        el.addEventListener("click", () => {
          setSelected(host);
          map.flyTo({ center: [host.lng!, host.lat!], zoom: 14 });
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([host.lng!, host.lat!])
          .addTo(map);

        markersRef.current.push(marker);
      });
    };

    loadMarkers();
  }, [hosts, mapReady]);

  const hasMapbox = Boolean(MAPBOX_TOKEN);

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none" style={{ background: "#3a2e1e" }}>

      {/* Map or SVG fallback */}
      {hasMapbox ? (
        <div
          ref={mapContainer}
          className="absolute inset-0"
          style={{ zIndex: 0, width: "100%", height: "100%" }}
        />
      ) : (
        <FallbackMap />
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,8,5,0.55) 100%)",
          zIndex: 1,
        }}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-6 pt-8">
        <div>
          <h1
            className="text-sm tracking-widest"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 300, color: "var(--color-nari)" }}
          >
            Tachibanashi
          </h1>
          <p
            className="text-xs mt-0.5 tracking-widest"
            style={{ fontFamily: "var(--font-label)", color: "var(--color-sub)", letterSpacing: "0.18em" }}
          >
            ✦ 立ち話の地図
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <ShareButton title="Tachibanashi — 立ち話" />
          <Link
            href="/login"
            className="rounded-sm text-xs tracking-widest uppercase px-3 py-1"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-sub)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-label)",
            }}
          >
            Host
          </Link>
          <div
            className="rounded-full border px-3 py-1 text-xs tracking-widest uppercase"
            style={{
              borderColor: "var(--color-amber)",
              color: "var(--color-amber)",
              fontFamily: "var(--font-label)",
            }}
          >
            Iwate
          </div>
        </div>
      </header>

      {/* SVG fallback pins for no-mapbox mode */}
      {!hasMapbox && hosts.filter((h) => h.lat === null).map((host, i) => (
        <button
          key={host.id}
          onClick={() => setSelected(host)}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-opacity duration-500"
          style={{
            left: `${30 + i * 20}%`,
            top: `${40 + i * 10}%`,
            opacity: host.status === "rest" ? 0.28 : 1,
          }}
        >
          {host.status === "active" && (
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(155,117,32,0.25)", animation: "ripple 2.4s ease-out infinite" }}
            />
          )}
          <span
            className="relative block h-4 w-4 rounded-full"
            style={{ background: "var(--color-amber)", boxShadow: host.status === "active" ? "0 0 12px 4px rgba(155,117,32,0.5)" : "none" }}
          />
        </button>
      ))}

      {/* Bottom Card */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-8">
        {selected ? (
          <Link href={`/profile/${selected.id}`} className="block">
            <div
              className="p-5"
              style={{
                borderRadius: 2,
                background: "rgba(28,22,14,0.82)",
                border: "1px solid var(--color-border)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Compass decoration */}
              <div className="flex items-start justify-between mb-3">
                <span
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
                >
                  ✦ 目的地
                </span>
                {selected.status === "rest" && (
                  <span
                    className="text-xs px-2 py-0.5"
                    style={{
                      color: "var(--color-border)",
                      border: "1px solid var(--color-border)",
                      fontFamily: "var(--font-label)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    休憩中
                  </span>
                )}
              </div>

              <p
                className="mb-4 text-base leading-relaxed"
                style={{ color: "var(--color-nari)" }}
              >
                {selected.hookSentence ? `「${selected.hookSentence}」` : selected.placeName}
              </p>

              <div className="flex items-baseline justify-between">
                <div>
                  <p
                    className="text-xs tracking-[0.18em] uppercase"
                    style={{ color: "var(--color-sub)", fontFamily: "var(--font-label)" }}
                  >
                    {selected.location}
                  </p>
                  <h2
                    className="mt-0.5 text-sm italic"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-sub)" }}
                  >
                    {selected.placeName}
                  </h2>
                </div>
                <span className="text-xl" style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}>
                  →
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div
            className="p-5 text-center"
            style={{
              borderRadius: 2,
              background: "rgba(28,22,14,0.82)",
              border: "1px solid var(--color-border)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p
              className="text-sm tracking-widest"
              style={{ color: "var(--color-border)", fontFamily: "var(--font-label)" }}
            >
              {hosts.length === 0 ? "まだホストが登録されていません" : "地図上のピンをタップ"}
            </p>
            <Link
              href="/register"
              className="mt-2 inline-block text-xs tracking-widest uppercase"
              style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
            >
              ホスト登録 →
            </Link>
          </div>
        )}
      </div>

      {/* Ripple keyframes */}
      <style>{`
        @keyframes ripple {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(4.5); opacity: 0; }
        }
        @keyframes pin-ripple {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(5);   opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Fallback SVG map when no Mapbox token
function FallbackMap() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="390" height="844" fill="#2a2015" />
      <path
        d="M280 0 L390 0 L390 300 L320 400 L390 500 L390 844 L310 844 L290 700 L250 600 L270 450 L230 350 L260 200 Z"
        fill="#231b0f"
        opacity="0.8"
      />
      <rect x="20" y="60" width="120" height="70" rx="2" fill="#312618" />
      <rect x="160" y="40" width="90" height="55" rx="2" fill="#312618" />
      <rect x="30" y="160" width="80" height="100" rx="2" fill="#312618" />
      <rect x="130" y="150" width="110" height="80" rx="2" fill="#312618" />
      <rect x="20" y="290" width="100" height="60" rx="2" fill="#312618" />
      <rect x="140" y="270" width="85" height="90" rx="2" fill="#312618" />
      <rect x="30" y="390" width="70" height="80" rx="2" fill="#312618" />
      <rect x="120" y="380" width="100" height="65" rx="2" fill="#312618" />
      <line x1="0" y1="140" x2="270" y2="140" stroke="#3d3020" strokeWidth="8" />
      <line x1="0" y1="260" x2="240" y2="260" stroke="#3d3020" strokeWidth="8" />
      <line x1="0" y1="370" x2="260" y2="370" stroke="#3d3020" strokeWidth="6" />
      <line x1="110" y1="0" x2="110" y2="844" stroke="#3d3020" strokeWidth="8" />
      <line x1="240" y1="0" x2="240" y2="844" stroke="#3d3020" strokeWidth="6" />
      <text x="115" y="256" fill="#4d3e28" fontSize="7" fontFamily="sans-serif" transform="rotate(-90 115 256)">ICHINOSEKI-EKI</text>
      <text x="10" y="136" fill="#4d3e28" fontSize="7" fontFamily="sans-serif">EKIMAE-DORI</text>
    </svg>
  );
}
