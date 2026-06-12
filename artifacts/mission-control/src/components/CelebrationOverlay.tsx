import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  hue: number;
  size: number;
}

const CONFETTI_HUES = [35, 50, 200, 280, 145, 25, 190];

function makeParticles(): Particle[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.7,
    duration: 1.5 + Math.random() * 1.5,
    hue: CONFETTI_HUES[Math.floor(Math.random() * CONFETTI_HUES.length)],
    size: 3 + Math.random() * 4,
  }));
}

export function CelebrationOverlay({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      setParticles(makeParticles());
    } else {
      const t = setTimeout(() => setParticles([]), 1600);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!active && particles.length === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-40 overflow-hidden rounded-xl"
      style={{ opacity: active ? 1 : 0, transition: "opacity 800ms ease-out" }}
      aria-hidden
    >
      {/* Gold sweep beam */}
      <div
        className="absolute -inset-1/4"
        style={{
          background: "linear-gradient(115deg, transparent 35%, rgba(245,200,80,0.16) 48%, rgba(255,220,120,0.28) 50%, rgba(245,200,80,0.16) 52%, transparent 65%)",
          transform: active ? "translateX(65%)" : "translateX(-65%)",
          transition: "transform 2400ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      />
      {/* Ambient tint */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(245,200,80,0.05)", opacity: active ? 1 : 0, transition: "opacity 900ms ease-out" }}
      />
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`, top: "-8px",
            width: p.size, height: p.size,
            backgroundColor: `hsl(${p.hue}, 88%, 65%)`,
            boxShadow: `0 0 5px hsl(${p.hue}, 88%, 58%)`,
            animation: `celebration-fall ${p.duration}s cubic-bezier(0.3, 0.6, 0.4, 1) ${p.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
      {/* TASK COMPLETE badge */}
      <div
        className="absolute top-4 left-1/2 pointer-events-none"
        style={{
          transform: active
            ? "translateX(-50%) translateY(0) scale(1)"
            : "translateX(-50%) translateY(-8px) scale(0.88)",
          opacity: active ? 1 : 0,
          transition: "opacity 300ms ease, transform 400ms cubic-bezier(0.3, 1.5, 0.5, 1)",
        }}
      >
        <div
          className="font-mono text-[9px] tracking-[0.24em] px-3 py-1 rounded-full border whitespace-nowrap"
          style={{
            background: "rgba(245,200,80,0.15)",
            borderColor: "rgba(245,200,80,0.40)",
            color: "rgba(255,225,130,0.95)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 14px rgba(245,200,80,0.22)",
          }}
        >
          ✦ TASK COMPLETE ✦
        </div>
      </div>
    </div>
  );
}
