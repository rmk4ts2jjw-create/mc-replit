import { useEffect, useState } from "react";
import { type WorkloadLevel, levelToEnergy } from "@/lib/room-energy";

interface RoomAmbientProps {
  roomId: string;
  accent: string;
  workloadLevel?: WorkloadLevel;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);
  return visible;
}

export function RoomAmbient({ roomId, accent, workloadLevel = "idle" }: RoomAmbientProps) {
  const visible = usePageVisible();
  if (!visible) return null;
  switch (roomId) {
    case "command":  return <CommandAmbient  accent={accent} workloadLevel={workloadLevel} />;
    case "security": return <SecurityAmbient accent={accent} workloadLevel={workloadLevel} />;
    case "workshop": return <WorkshopAmbient accent={accent} workloadLevel={workloadLevel} />;
    case "archive":  return <ArchiveAmbient  accent={accent} workloadLevel={workloadLevel} />;
    default:         return null;
  }
}

function CoffeeSteam({ accent, left, top, fast }: { accent: string; left: string; top: string; fast?: boolean }) {
  return (
    <div className="absolute pointer-events-none" style={{ left, top, width: 14, height: 22 }} aria-hidden>
      <div className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 4, height: 4, backgroundColor: accent, opacity: 0.55, animation: `steam-wisp ${fast ? 2.2 : 3.4}s ease-out infinite` }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 3, height: 3, backgroundColor: accent, opacity: 0.45, animation: `steam-wisp ${fast ? 2.8 : 4.2}s ease-out infinite`, animationDelay: "1.3s" }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 3, height: 3, backgroundColor: accent, opacity: 0.35, animation: `steam-wisp ${fast ? 2.5 : 3.8}s ease-out infinite`, animationDelay: "2.4s" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-sm"
        style={{ width: 8, height: 6, backgroundColor: "#3a2a1f", opacity: 0.7 }} />
    </div>
  );
}

// ── Command ─────────────────────────────────────────────────────────────────
function CommandAmbient({ accent, workloadLevel }: { accent: string; workloadLevel: WorkloadLevel }) {
  const [monitors, setMonitors] = useState<[number, number, number]>([0.3, 0.5, 0.4]);
  const [starRotation, setStarRotation] = useState(0);
  const [blinkOn, setBlinkOn] = useState(false);
  const [led2On, setLed2On] = useState(true);

  const energy     = levelToEnergy(workloadLevel);
  const isCritical = workloadLevel === "critical";
  const isHeavy    = workloadLevel === "heavy" || isCritical;
  const monBase    = 0.15 + energy * 0.18;
  const monDelay   = isCritical ? 1100 : workloadLevel === "heavy" ? 1700 : workloadLevel === "medium" ? 2400 : 3000;

  useEffect(() => {
    const i1 = setInterval(() => setMonitors(p => [p[0] < 0.5 ? 0.9 : 0.3, p[1], p[2]] as [number,number,number]), monDelay);
    const i2 = setInterval(() => setMonitors(p => [p[0], p[1] < 0.5 ? 0.8 : 0.4, p[2]] as [number,number,number]), monDelay + 1100);
    const i3 = setInterval(() => setMonitors(p => [p[0], p[1], p[2] < 0.6 ? 1.0 : 0.4] as [number,number,number]), monDelay + 2300);
    return () => { clearInterval(i1); clearInterval(i2); clearInterval(i3); };
  }, [monDelay]);

  const starSpeed = isCritical ? 66 : workloadLevel === "heavy" ? 90 : workloadLevel === "medium" ? 120 : 166;
  useEffect(() => {
    const interval = setInterval(() => setStarRotation(f => (f + 1) % 360), starSpeed);
    return () => clearInterval(interval);
  }, [starSpeed]);

  const blinkBase   = isCritical ? 2000 : workloadLevel === "heavy" ? 5000 : 15000;
  const blinkJitter = isCritical ? 2000 : 15000;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sched = () => { timer = setTimeout(() => { setBlinkOn(true); setTimeout(() => setBlinkOn(false), isCritical ? 200 : 120); sched(); }, blinkBase + Math.random() * blinkJitter); };
    sched();
    return () => clearTimeout(timer);
  }, [blinkBase, blinkJitter, isCritical]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sched = () => { timer = setTimeout(() => { setLed2On(v => !v); sched(); }, 20000 + Math.random() * 20000); };
    sched();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute transition-all duration-[2000ms]"
        style={{ left: "15%", top: "15%", width: "20%", height: "15%", backgroundColor: accent, opacity: monitors[0] * monBase, borderRadius: 2 }} />
      <div className="absolute transition-all duration-[2000ms]"
        style={{ left: "40%", top: "12%", width: "22%", height: "18%", backgroundColor: accent, opacity: monitors[1] * (monBase - 0.02), borderRadius: 2, transform: `rotate(${starRotation * 0.02}deg)` }} />
      <div className="absolute transition-all duration-[2000ms]"
        style={{ left: "68%", top: "15%", width: "18%", height: "15%", backgroundColor: accent, opacity: monitors[2] * monBase, borderRadius: 2 }} />
      <div className="absolute pointer-events-none"
        style={{ left: "88%", top: "12%", width: 4, height: 4, borderRadius: "50%", backgroundColor: blinkOn ? "#ff4040" : "#552020", opacity: blinkOn ? 0.95 : 0.45, boxShadow: blinkOn ? "0 0 6px #ff4040" : "none", transition: `all ${isCritical ? 0.08 : 0.15}s ease` }} />
      <div className="absolute pointer-events-none"
        style={{ left: "88%", top: "18%", width: 4, height: 4, borderRadius: "50%", backgroundColor: led2On ? "#40d080" : "#205040", opacity: led2On ? 0.85 : 0.4, boxShadow: led2On ? "0 0 5px #40d080" : "none", transition: "all 0.4s ease" }} />
      <CoffeeSteam accent="#d4a574" left="10%" top="55%" fast={isHeavy} />
      {isHeavy && (
        <div className="absolute pointer-events-none"
          style={{ left: "5%", top: "86%", width: "90%", height: 1, backgroundColor: accent, opacity: 0.1 + energy * 0.12, animation: "data-stream 2s linear infinite" }} />
      )}
      {isCritical && (
        <div className="absolute pointer-events-none"
          style={{ left: "14%", top: "23%", width: 4, height: 4, borderRadius: "50%", backgroundColor: "#ff4040", boxShadow: "0 0 8px #ff4040", animation: "pulse-fast 0.5s ease-in-out infinite" }} />
      )}
    </div>
  );
}

// ── Security ────────────────────────────────────────────────────────────────
function SecurityAmbient({ accent, workloadLevel }: { accent: string; workloadLevel: WorkloadLevel }) {
  const [radarAngle,  setRadarAngle]  = useState(0);
  const [camView,     setCamView]     = useState(0);
  const [alertFlash,  setAlertFlash]  = useState(false);
  const [terminalLine,setTerminalLine]= useState(0);

  const energy     = levelToEnergy(workloadLevel);
  const isCritical = workloadLevel === "critical";
  const isHeavy    = workloadLevel === "heavy" || isCritical;

  const radarStep = isCritical ? 14 : workloadLevel === "heavy" ? 10 : workloadLevel === "medium" ? 8 : 6;
  useEffect(() => {
    const interval = setInterval(() => setRadarAngle(prev => (prev + radarStep) % 360), 66);
    return () => clearInterval(interval);
  }, [radarStep]);

  useEffect(() => {
    const interval = setInterval(() => setCamView(prev => (prev + 1) % 3), 6000);
    return () => clearInterval(interval);
  }, []);

  const alertBase   = isCritical ? 3000 : workloadLevel === "heavy" ? 8000 : 20000;
  const alertJitter = isCritical ? 3000 : 20000;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sched = () => { timer = setTimeout(() => { setAlertFlash(true); setTimeout(() => setAlertFlash(false), isCritical ? 500 : 320); sched(); }, alertBase + Math.random() * alertJitter); };
    sched();
    return () => clearTimeout(timer);
  }, [alertBase, alertJitter, isCritical]);

  const termSpeed = isCritical ? 350 : workloadLevel === "heavy" ? 550 : workloadLevel === "medium" ? 750 : 1100;
  useEffect(() => {
    const interval = setInterval(() => setTerminalLine(p => (p + 1) % 6), termSpeed);
    return () => clearInterval(interval);
  }, [termSpeed]);

  const camHues = [320, 200, 30];
  const TERM_LINES = isCritical
    ? ["!! ALERT: hull sector 7-G !!", "SCAN: intruder detected?", "AUTH: elevated level 3", "SENS: thermal spike +2.4°", "FEED: cam-03 MOTION", "LINK: gateway ALERT"]
    : ["SCAN: sector 7-G clear", "PING: hull integrity 99.8%", "SENS: thermal nominal", "AUTH: 0 pending requests", "FEED: cam-03 motion +0", "LINK: gateway stable"];

  const termColor  = isCritical ? "#ff6060" : isHeavy ? "#ff90c0" : accent;
  const radarColor = isCritical ? "rgba(255,60,40,0.55)" : `${accent}30`;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute"
        style={{ left: "5%", top: "42%", width: "18%", height: "28%", background: `conic-gradient(from ${radarAngle}deg, transparent 0deg, ${radarColor} 25deg, ${accent}10 55deg, transparent 70deg)`, borderRadius: "50%", opacity: 0.5 + energy * 0.3, filter: `drop-shadow(0 0 4px ${accent}60)` }} />
      <div className="absolute rounded-full"
        style={{ left: "calc(5% + 9%)", top: "calc(42% + 14%)", width: 4, height: 4, marginLeft: -2, marginTop: -2, backgroundColor: isCritical ? "#ff4040" : accent, opacity: 0.8, animation: `ambient-pulse ${isCritical ? 0.8 : 2}s ease-in-out infinite` }} />
      <div className="absolute transition-all duration-[1000ms]"
        style={{ left: "5%", top: "23%", width: "85%", height: "13%", filter: `hue-rotate(${camHues[camView]}deg)`, opacity: 0.12 + energy * 0.1, backgroundColor: accent }} />
      <div className="absolute font-mono overflow-hidden"
        style={{ left: "26%", top: "46%", width: "42%", height: "10%", backgroundColor: `rgba(8,6,${isCritical ? 8 : 16},0.7)`, border: `1px solid ${isCritical ? "#ff404040" : accent + "30"}`, borderRadius: 2, fontSize: 6, lineHeight: 1.1, color: termColor, padding: "2px 4px", opacity: 0.9 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ opacity: 0.5 + i * 0.18 }}>
            &gt; {TERM_LINES[(terminalLine + i) % TERM_LINES.length]}
          </div>
        ))}
      </div>
      {alertFlash && (
        <div className="absolute"
          style={{ left: "42%", top: "62%", width: 6, height: 6, borderRadius: "50%", backgroundColor: isCritical ? "#ff4020" : "#ff8000", boxShadow: `0 0 ${isCritical ? 14 : 8}px ${isCritical ? "#ff4020" : "#ff8000"}` }} />
      )}
      {isHeavy && (
        <div className="absolute rounded-full"
          style={{ left: "74%", top: "62%", width: 4, height: 4, backgroundColor: accent, opacity: 0.5 + energy * 0.3, boxShadow: `0 0 6px ${accent}`, animation: `ambient-pulse ${isCritical ? 0.6 : 1.2}s ease-in-out infinite` }} />
      )}
    </div>
  );
}

// ── Workshop ────────────────────────────────────────────────────────────────
function WorkshopAmbient({ accent, workloadLevel }: { accent: string; workloadLevel: WorkloadLevel }) {
  const [spark,          setSpark]          = useState(false);
  const [blueprintAngle, setBlueprintAngle] = useState(0);
  const [lightPulse,     setLightPulse]     = useState(0.4);
  const [printHead,      setPrintHead]      = useState(0);

  const energy     = levelToEnergy(workloadLevel);
  const isCritical = workloadLevel === "critical";
  const isHeavy    = workloadLevel === "heavy" || isCritical;

  const sparkBase   = isCritical ? 400 : workloadLevel === "heavy" ? 900 : workloadLevel === "medium" ? 1800 : 3000;
  const sparkJitter = isCritical ? 800 : 2000;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sched = () => { timer = setTimeout(() => { setSpark(true); setTimeout(() => setSpark(false), isCritical ? 280 : 200); sched(); }, sparkBase + Math.random() * sparkJitter); };
    sched();
    return () => clearTimeout(timer);
  }, [sparkBase, sparkJitter, isCritical]);

  const bpStep = isCritical ? 2.8 : workloadLevel === "heavy" ? 2.2 : workloadLevel === "medium" ? 1.6 : 1.0;
  useEffect(() => {
    const interval = setInterval(() => setBlueprintAngle(prev => (prev + bpStep) % 360), 100);
    return () => clearInterval(interval);
  }, [bpStep]);

  useEffect(() => {
    let dir = 1;
    const interval = setInterval(() => {
      setLightPulse(prev => { const next = prev + dir * 0.05; if (next >= 1.0) { dir = -1; return 1.0; } if (next <= 0.4) { dir = 1; return 0.4; } return next; });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const headSpeed = isCritical ? 2.2 : workloadLevel === "heavy" ? 1.7 : workloadLevel === "medium" ? 1.3 : 1.0;
  useEffect(() => {
    let dir = 1;
    const interval = setInterval(() => {
      setPrintHead(prev => { const next = prev + dir * headSpeed; if (next >= 100) { dir = -1; return 100; } if (next <= 0) { dir = 1; return 0; } return next; });
    }, 50);
    return () => clearInterval(interval);
  }, [headSpeed]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {spark && (
        <div className="absolute"
          style={{ left: "14%", top: "48%", width: isCritical ? 16 : 12, height: isCritical ? 16 : 12, borderRadius: "50%", backgroundColor: isCritical ? "#ff8800" : "#ffffff", boxShadow: `0 0 ${isCritical ? 16 : 12}px ${accent}, 0 0 ${isCritical ? 28 : 20}px ${accent}80`, opacity: 0.9 + energy * 0.1 }} />
      )}
      <div className="absolute"
        style={{ left: "36%", top: "49%", width: "28%", height: "13%", background: `conic-gradient(from ${blueprintAngle}deg, transparent, ${accent}${isHeavy ? "38" : "25"}, transparent)`, borderRadius: 4, opacity: 0.8 + energy * 0.2 }} />
      <div className="absolute"
        style={{ left: "5%", top: "37%", width: "90%", height: "3%", backgroundColor: accent, opacity: lightPulse * (0.25 + energy * 0.15), borderRadius: 2 }} />
      <div className="absolute"
        style={{ left: "70%", top: "55%", width: "22%", height: "12%", border: `1px solid ${accent}${isHeavy ? "60" : "40"}`, borderRadius: 2, backgroundColor: "rgba(8,18,24,0.45)", overflow: "hidden" }}>
        <div className="absolute top-0 bottom-0"
          style={{ left: `${printHead}%`, width: 3, marginLeft: -1.5, backgroundColor: accent, opacity: 0.8, boxShadow: `0 0 4px ${accent}` }} />
        <div className="absolute left-0 right-0 bottom-0"
          style={{ height: 2, backgroundColor: accent, opacity: 0.5 }} />
      </div>
      {isHeavy && (
        <div className="absolute"
          style={{ left: "5%", top: "90%", width: `${40 + energy * 50}%`, height: 1, backgroundColor: accent, opacity: 0.25, borderRadius: 1 }} />
      )}
    </div>
  );
}

// ── Archive ─────────────────────────────────────────────────────────────────
function ArchiveAmbient({ accent, workloadLevel }: { accent: string; workloadLevel: WorkloadLevel }) {
  const [lanterns,    setLanterns]    = useState([0.7, 0.5, 0.8]);
  const [dust,        setDust]        = useState(() => Array.from({ length: 5 }, (_, i) => ({ x: 15 + i * 18, y: 60 + (i % 3) * 15 })));
  const [crystalGlow, setCrystalGlow] = useState(false);
  const [bookOut,     setBookOut]     = useState(false);

  const energy     = levelToEnergy(workloadLevel);
  const isCritical = workloadLevel === "critical";
  const isHeavy    = workloadLevel === "heavy" || isCritical;

  useEffect(() => {
    const speeds = [2000, 2700, 3400].map(s => isCritical ? s * 0.4 : workloadLevel === "heavy" ? s * 0.6 : s);
    const intervals = speeds.map((speed, i) =>
      setInterval(() => {
        setLanterns(prev => { const next = [...prev]; next[i] = 0.3 + seededRandom(Date.now() / speed + i * 100) * 0.7; return next; });
      }, speed)
    );
    return () => intervals.forEach(clearInterval);
  }, [workloadLevel, isCritical]);

  const dustInterval = isCritical ? 50 : workloadLevel === "heavy" ? 75 : 120;
  useEffect(() => {
    const interval = setInterval(() => {
      setDust(prev => prev.map((p, i) => {
        const ny = p.y - (0.4 + energy * 0.35);
        const nx = p.x + (seededRandom(Date.now() / 800 + i) - 0.5) * 0.6;
        return { x: nx, y: ny < -5 ? 100 : ny };
      }));
    }, dustInterval);
    return () => clearInterval(interval);
  }, [dustInterval, energy]);

  const crystalBase   = isCritical ? 1500 : workloadLevel === "heavy" ? 3000 : 5000;
  const crystalJitter = isCritical ? 1500 : workloadLevel === "heavy" ? 2000 : 10000;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sched = () => { timer = setTimeout(() => { setCrystalGlow(true); setTimeout(() => setCrystalGlow(false), isCritical ? 800 : 500); sched(); }, crystalBase + Math.random() * crystalJitter); };
    sched();
    return () => clearTimeout(timer);
  }, [crystalBase, crystalJitter, isCritical]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const delay = isHeavy ? 8000 : 18000, jitter = isHeavy ? 6000 : 17000;
    const sched = () => { timer = setTimeout(() => { setBookOut(true); setTimeout(() => setBookOut(false), 2200); sched(); }, delay + Math.random() * jitter); };
    sched();
    return () => clearTimeout(timer);
  }, [isHeavy]);

  const lanternPositions = [{ left: "17%", top: "41%" }, { left: "48%", top: "36%" }, { left: "78%", top: "42%" }];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {lanterns.map((brightness, i) => (
        <div key={`lantern-${i}`} className="absolute rounded-full"
          style={{ ...lanternPositions[i], width: isHeavy ? 10 : 8, height: isHeavy ? 10 : 8, backgroundColor: accent, opacity: brightness * (0.6 + energy * 0.25), boxShadow: `0 0 ${6 + brightness * (10 + energy * 8)}px ${accent}${Math.round(brightness * 50).toString(16).padStart(2,"0")}`, transition: "opacity 0.4s ease, box-shadow 0.4s ease" }} />
      ))}
      {dust.map((p, i) => (
        <div key={`dust-${i}`} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: isHeavy ? 3 : 2, height: isHeavy ? 3 : 2, backgroundColor: accent, opacity: 0.3 + (i % 3) * 0.12 + energy * 0.08 }} />
      ))}
      {crystalGlow && (
        <div className="absolute"
          style={{ left: "10%", top: "26%", width: "80%", height: isHeavy ? "18%" : "15%", backgroundColor: accent, opacity: 0.1 + energy * 0.08, borderRadius: 4, boxShadow: `0 0 ${16 + energy * 12}px ${accent}40` }} />
      )}
      <div className="absolute"
        style={{ left: "62%", top: "44%", width: 6, height: 10, borderRadius: 1, backgroundColor: accent, opacity: 0.7, transform: `translateX(${bookOut ? (isHeavy ? 9 : 6) : 0}px)`, transition: "transform 1s cubic-bezier(0.4,0,0.2,1)", boxShadow: bookOut ? `0 0 ${isHeavy ? 7 : 4}px ${accent}80` : "none" }} />
      {isCritical && (
        <div className="absolute"
          style={{ left: "48%", top: "36%", width: 4, height: 4, borderRadius: "50%", backgroundColor: "#ffcc00", opacity: 0.8, boxShadow: "0 0 8px #ffcc00", animation: "pulse-fast 0.6s ease-in-out infinite" }} />
      )}
    </div>
  );
}
