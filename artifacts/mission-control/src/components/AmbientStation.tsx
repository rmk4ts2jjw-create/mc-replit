import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { STATION_CHATTER } from "@/lib/delights";
import { CelebrationOverlay } from "./CelebrationOverlay";

interface AmbientStationProps {
  mood: "calm" | "busy" | "alert" | "critical";
  celebrating?: boolean;
  children?: React.ReactNode;
}

interface Ship {
  id: number;
  topPct: number;
  duration: number;
  delay: number;
  opacity: number;
  direction: "left" | "right";
  size: number;
}

function generateShips(count: number): Ship[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    topPct: 2 + Math.random() * 18,
    duration: 15 + Math.random() * 15,
    delay: Math.random() * 20,
    opacity: 0.15 + Math.random() * 0.1,
    direction: Math.random() > 0.5 ? "left" : "right",
    size: 6 + Math.floor(Math.random() * 4),
  }));
}

function useClientShips(count: number): Ship[] {
  const [ships, setShips] = useState<Ship[]>([]);
  const generated = useRef(false);
  useEffect(() => {
    if (!generated.current) { generated.current = true; setShips(generateShips(count)); }
  }, [count]);
  return ships;
}

function ShipFlyBy({ ship, viewportWidth }: { ship: Ship; viewportWidth: number }) {
  const startX = ship.direction === "left" ? -40 : viewportWidth + 40;
  const endX = ship.direction === "left" ? viewportWidth + 40 : -40;

  return (
    <motion.div className="absolute pointer-events-none" style={{ top: `${ship.topPct}%`, left: 0, opacity: ship.opacity }}
      animate={{ x: [startX, endX] }}
      transition={{ duration: ship.duration, delay: ship.delay, repeat: Infinity, ease: "linear" }}>
      <div className="bg-foreground/60 rounded-sm" style={{ width: `${ship.size * 2}px`, height: `${ship.size * 0.6}px`, position: "relative" }}>
        <div className="absolute top-1/2 -translate-y-1/2 bg-foreground/30 rounded-full"
          style={{ width: `${ship.size * 0.8}px`, height: "2px", left: ship.direction === "left" ? -ship.size * 0.6 : ship.size * 1.8 }} />
      </div>
    </motion.div>
  );
}

function StationChatter() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex(prev => (prev + 1) % STATION_CHATTER.length), 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-4 overflow-hidden">
      {STATION_CHATTER.map((msg, i) => (
        <motion.div
          key={msg}
          className="absolute inset-0 flex items-center justify-center font-mono text-[8px] text-muted-foreground/40 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: i === index ? 1 : 0, y: i === index ? 0 : i < index ? -4 : 4 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {msg}
        </motion.div>
      ))}
    </div>
  );
}

const MOOD_TINTS: Record<string, { color: string; min: number; max: number; duration: number }> = {
  calm:     { color: "rgba(80, 140, 255, 1)",  min: 0.015, max: 0.04,  duration: 8   },
  busy:     { color: "rgba(180, 140, 90, 1)",  min: 0.03,  max: 0.07,  duration: 5   },
  alert:    { color: "rgba(255, 120, 60, 1)",  min: 0.06,  max: 0.12,  duration: 3.5 },
  critical: { color: "rgba(255, 60, 60, 1)",   min: 0.08,  max: 0.16,  duration: 2.5 },
};

function LightingOverlay({ mood }: { mood: AmbientStationProps["mood"] }) {
  const tint = MOOD_TINTS[mood];
  return (
    <motion.div
      key={mood}
      className="absolute inset-0 pointer-events-none rounded-inherit"
      style={{ backgroundColor: tint.color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [tint.min, tint.max, tint.min] }}
      transition={{ opacity: { duration: tint.duration, repeat: Infinity, ease: "easeInOut" } }}
    />
  );
}

interface Star { id: number; left: string; top: string; size: number; delay: number; duration: number; }

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    size: 2 + Math.floor(Math.random() * 2), delay: Math.random() * 5, duration: 2 + Math.random() * 3,
  }));
}

function useClientStars(count: number): Star[] {
  const [stars, setStars] = useState<Star[]>([]);
  const generated = useRef(false);
  useEffect(() => {
    if (!generated.current) { generated.current = true; setStars(generateStars(count)); }
  }, [count]);
  return stars;
}

function TwinklingStars() {
  const stars = useClientStars(18);
  return (
    <>
      <style>{`@keyframes twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.7; } } .ambient-star { animation-name: twinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }`}</style>
      {stars.map(star => (
        <div key={star.id} className="ambient-star absolute rounded-full bg-white pointer-events-none"
          style={{ left: star.left, top: star.top, width: `${star.size}px`, height: `${star.size}px`, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` }} />
      ))}
    </>
  );
}

export function AmbientStation({ mood, celebrating, children }: AmbientStationProps) {
  const [viewportWidth, setViewportWidth] = useState(1200);
  const ships = useClientShips(3);

  useEffect(() => {
    function handleResize() { setViewportWidth(window.innerWidth); }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative rounded-inherit overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0"><TwinklingStars /></div>
      <LightingOverlay mood={mood} />
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {ships.map(ship => <ShipFlyBy key={ship.id} ship={ship} viewportWidth={viewportWidth} />)}
      </div>
      <div className="relative z-20">{children}</div>
      <CelebrationOverlay active={!!celebrating} />
      <div className="relative z-20 mt-2"><StationChatter /></div>
    </div>
  );
}
