import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  hue: number;
  size: number;
}

function makeParticles(): Particle[] {
  return Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.6 + Math.random() * 1.2,
    hue: 35 + Math.random() * 20,
    size: 3 + Math.random() * 3,
  }));
}

export function CelebrationOverlay({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      setParticles(makeParticles());
    } else {
      const t = setTimeout(() => setParticles([]), 1200);
      return () => clearTimeout(t);
    }
  }, [active]);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
      style={{ opacity: active ? 1 : 0, transition: "opacity 700ms ease-out" }}
      aria-hidden
    >
      <div
        className="absolute -inset-1/4"
        style={{
          background: "linear-gradient(115deg, transparent 35%, rgba(245,200,80,0.18) 48%, rgba(255,220,120,0.30) 50%, rgba(245,200,80,0.18) 52%, transparent 65%)",
          transform: active ? "translateX(60%)" : "translateX(-60%)",
          transition: "transform 2400ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(245,200,80,0.06)", opacity: active ? 1 : 0, transition: "opacity 900ms ease-out" }} />
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`, top: "-8px", width: p.size, height: p.size,
            backgroundColor: `hsl(${p.hue}, 90%, 65%)`,
            boxShadow: `0 0 4px hsl(${p.hue}, 90%, 60%)`,
            animation: `celebration-fall ${p.duration}s cubic-bezier(0.3, 0.6, 0.4, 1) ${p.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
