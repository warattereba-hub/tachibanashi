"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

const NOREN_COLOR_LEFT  = "#2a1f0c";
const NOREN_COLOR_RIGHT = "#261b0b";
const STRIPE_COLOR      = "#8b6914";
const TEXT_COLOR        = "#c4b89a";
const PANEL_W           = 0.5;   // fraction of canvas width per panel
const OPEN_THRESHOLD    = 0.72;  // fraction of canvas height dragged to "open"

type Phase = "idle" | "dragging" | "animating" | "open";

export default function NorenCanvas({ hostId }: { hostId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef  = useRef<Phase>("idle");
  const progressRef = useRef(0);   // 0 = closed, 1 = fully open
  const dragStartY  = useRef(0);
  const rafRef      = useRef<number>(0);

  const [phase, setPhase]     = useState<Phase>("idle");
  const [showMsg, setShowMsg] = useState(false);
  const [hostMessage, setHostMessage] = useState("気軽にどうぞ。\n店にいます。");
  const [hostName, setHostName] = useState<string | null>(null);

  useEffect(() => {
    if (!hostId) return;
    fetch(`/api/hosts/${hostId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.host?.hostMessage) setHostMessage(data.host.hostMessage);
        if (data.host?.placeName) setHostName(data.host.placeName);
      })
      .catch(() => {});
  }, [hostId]);

  /* ── Draw ── */
  const draw = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#1a1510";
    ctx.fillRect(0, 0, W, H);

    // Subtle radial glow behind noren
    const grd = ctx.createRadialGradient(cx, H * 0.3, 0, cx, H * 0.3, W * 0.6);
    grd.addColorStop(0, "rgba(139,105,20,0.08)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    const openY = H * progress;          // how far the panels have slid up
    const sag   = H * 0.18 * progress;   // extra droop at the bottom hem

    // Draw one panel: left (slides left) or right (slides right)
    const drawPanel = (side: "left" | "right") => {
      const isLeft  = side === "left";
      const x0      = isLeft ? 0 : cx;
      const x1      = isLeft ? cx : W;
      const slideX  = (isLeft ? -1 : 1) * W * 0.18 * progress;

      const topY    = -openY * 0.05;                    // top edge barely moves
      const midY    = H * 0.45 - openY * 0.6 + sag;    // hem sags when opening
      const botY    = H       - openY * 0.9 + sag * 1.4;

      ctx.save();
      ctx.translate(slideX, 0);

      // Panel shape — bezier curve on the inner edge for drape effect
      ctx.beginPath();
      if (isLeft) {
        const drapeX = cx - W * 0.06 * Math.sin(progress * Math.PI);
        ctx.moveTo(x0, topY);
        ctx.lineTo(x1, topY);
        ctx.quadraticCurveTo(drapeX, midY, x1, botY);
        ctx.lineTo(x0, botY);
      } else {
        const drapeX = cx + W * 0.06 * Math.sin(progress * Math.PI);
        ctx.moveTo(x1, topY);
        ctx.lineTo(x0, topY);
        ctx.quadraticCurveTo(drapeX, midY, x0, botY);
        ctx.lineTo(x1, botY);
      }
      ctx.closePath();

      // Fabric fill with subtle gradient
      const grad = ctx.createLinearGradient(x0, 0, x1, 0);
      if (isLeft) {
        grad.addColorStop(0, NOREN_COLOR_LEFT);
        grad.addColorStop(1, "#221808");
      } else {
        grad.addColorStop(0, "#221808");
        grad.addColorStop(1, NOREN_COLOR_RIGHT);
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Amber vertical stripes
      const stripeCount = 3;
      const panelW = cx;
      ctx.strokeStyle = STRIPE_COLOR;
      ctx.globalAlpha = 0.25;
      for (let i = 1; i <= stripeCount; i++) {
        const sx = isLeft
          ? x0 + panelW * (i / (stripeCount + 1))
          : x0 + panelW * (i / (stripeCount + 1));
        ctx.beginPath();
        ctx.moveTo(sx, topY + 8);
        ctx.lineTo(sx, botY - 8);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Kanji text on panel
      ctx.save();
      ctx.font = `bold ${W * 0.065}px "Noto Serif JP", serif`;
      ctx.fillStyle = TEXT_COLOR;
      ctx.globalAlpha = Math.max(0, 1 - progress * 2.5);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (isLeft) {
        ctx.fillText("立", cx * 0.5, H * 0.38);
        ctx.fillText("話", cx * 0.5, H * 0.52);
      } else {
        ctx.fillText("つ", cx + cx * 0.5, H * 0.38);
        ctx.fillText("ぎ", cx + cx * 0.5, H * 0.52);
      }
      ctx.restore();

      // Fabric fold shading on inner edge
      const shadowGrad = ctx.createLinearGradient(
        isLeft ? cx - 20 : cx,
        0,
        isLeft ? cx : cx + 20,
        0
      );
      shadowGrad.addColorStop(0, isLeft ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0)");
      shadowGrad.addColorStop(1, isLeft ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.35)");

      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      if (isLeft) {
        const drapeX = cx - W * 0.06 * Math.sin(progress * Math.PI);
        ctx.moveTo(cx - 20, topY);
        ctx.lineTo(cx, topY);
        ctx.quadraticCurveTo(drapeX, midY, cx, botY);
        ctx.lineTo(cx - 20, botY);
      } else {
        const drapeX = cx + W * 0.06 * Math.sin(progress * Math.PI);
        ctx.moveTo(cx, topY);
        ctx.lineTo(cx + 20, topY);
        ctx.lineTo(cx + 20, botY);
        ctx.quadraticCurveTo(drapeX, midY, cx, botY);
      }
      ctx.closePath();
      ctx.fill();

      // Top rod
      ctx.restore();
      ctx.save();
      ctx.translate(slideX, 0);
      ctx.fillStyle = "#3d3529";
      ctx.fillRect(x0, topY - 4, panelW, 7);
      ctx.restore();
    };

    drawPanel("left");
    drawPanel("right");

    // Top horizontal rod
    ctx.fillStyle = "#4a3f30";
    ctx.fillRect(0, -openY * 0.05 - 6, W, 6);

    // Hint text when closed
    if (progress < 0.05) {
      ctx.font = `${W * 0.032}px "Special Elite", cursive`;
      ctx.fillStyle = STRIPE_COLOR;
      ctx.globalAlpha = 0.7;
      ctx.textAlign = "center";
      ctx.fillText("— 上にスワイプして暖簾を開ける —", cx, H * 0.88);
      ctx.globalAlpha = 1;
    }
  }, []);

  /* ── Animate to open/close ── */
  const animateTo = useCallback((target: number, onDone?: () => void) => {
    const startVal = progressRef.current;
    const startTime = performance.now();
    const duration = 500;

    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
      progressRef.current = startVal + (target - startVal) * eased;
      draw(progressRef.current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        progressRef.current = target;
        draw(target);
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [draw]);

  /* ── Pointer handlers ── */
  const getClientY = (e: React.TouchEvent | React.MouseEvent) =>
    "touches" in e ? e.touches[0].clientY : e.clientY;

  const onPointerDown = (e: React.TouchEvent | React.MouseEvent) => {
    if (phaseRef.current === "open" || phaseRef.current === "animating") return;
    cancelAnimationFrame(rafRef.current);
    dragStartY.current = getClientY(e);
    phaseRef.current = "dragging";
    setPhase("dragging");
  };

  const onPointerMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (phaseRef.current !== "dragging") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dy = dragStartY.current - getClientY(e);
    const raw = Math.max(0, Math.min(1, dy / canvas.height));
    progressRef.current = raw;
    draw(raw);
  };

  const onPointerUp = () => {
    if (phaseRef.current !== "dragging") return;
    phaseRef.current = "animating";
    setPhase("animating");
    if (progressRef.current >= OPEN_THRESHOLD) {
      animateTo(1, () => {
        phaseRef.current = "open";
        setPhase("open");
        setShowMsg(true);
      });
    } else {
      animateTo(0, () => {
        phaseRef.current = "idle";
        setPhase("idle");
      });
    }
  };

  /* ── Resize & initial draw ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw(progressRef.current);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div className="relative h-screen h-dvh w-screen w-dvw overflow-hidden" style={{ background: "var(--color-ink)" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: phase === "open" ? "default" : "grab" }}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      />

      {/* Host message */}
      {showMsg && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          style={{ animation: "fadeIn 0.8s ease forwards" }}
        >
          <p
            className="mb-2 text-xs tracking-[0.25em] uppercase"
            style={{ color: "var(--color-amber)", fontFamily: "var(--font-label)" }}
          >
            from the host
          </p>
          {hostName && (
            <p
              className="mb-3 text-sm italic"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-sub)" }}
            >
              {hostName}
            </p>
          )}
          <p
            className="mb-10 text-2xl leading-[1.8]"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-nari)", whiteSpace: "pre-line" }}
          >
            {hostMessage}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/">
              <button
                className="rounded-full px-6 py-2.5 text-xs tracking-[0.2em] uppercase transition-opacity active:opacity-60"
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-sub)",
                  fontFamily: "var(--font-label)",
                  background: "var(--color-surface)",
                }}
              >
                ← 地図にもどる
              </button>
            </Link>
            <ShareButton title="Tachibanashi — 暖簾をくぐる" text="気軽にどうぞ。店にいます。" />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
