import { useEffect, useState } from "react";

interface RoomAmbientProps {
  roomId: string;
  accent: string;
  intense?: boolean;
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

export function RoomAmbient({ roomId, accent, intense }: RoomAmbientProps) {
  const visible = usePageVisible();
  if (!visible) return null;

  switch (roomId) {
    case "command": return <CommandAmbient accent={accent} intense={intense} />;
    case "security": return <SecurityAmbient accent={accent} intense={intense} />;
    case "workshop": return <WorkshopAmbient accent={accent} intense={intense} />;
    case "archive": return <ArchiveAmbient accent={accent} intense={intense} />;
    default: return null;
  }
}

function CoffeeSteam({ accent, left, top }: { accent: string; left: string; top: string }) {
  return (
    <div className="absolute pointer-events-none" style={{ left, top, width: 14, height: 22 }} aria-hidden>
      <div className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 4, height: 4, backgroundColor: accent, opacity: 0.55, animation: "steam-wisp 3.4s ease-out infinite" }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 3, height: 3, backgroundColor: accent, opacity: 0.45, animation: "steam-wisp 4.2s ease-out infinite", animationDelay: "1.3s" }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 3, height: 3, backgroundColor: accent, opacity: 0.35, animation: "steam-wisp 3.8s ease-out infinite", animationDelay: "2.4s" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-sm"
        style={{ width: 8, height: 6, backgroundColor: "#3a2a1f", opacity: 0.7 }} />
    </div>
  );
}

function CommandAmbient({ accent }: { accent: string; intense?: boolean }) {
  const [monitors, setMonitors] = useState<[number, number, number]>([0.3, 0.5, 0.4]);
  const [starRotation, setStarRotation] = useState(0);
  const [blinkOn, setBlinkOn] = useState(false);
  const [led2On, setLed2On] = useState(true);

  useEffect(() => {
    const i1 = setInterval(() => setMonitors(p => [p[0] < 0.5 ? 0.9 : 0.3, p[1], p[2]] as [number,number,number]), 3000);
    const i2 = setInterval(() => setMonitors(p => [p[0], p[1] < 0.5 ? 0.8 : 0.4, p[2]] as [number,number,number]), 4100);
    const i3 = setInterval(() => setMonitors(p => [p[0], p[1], p[2] < 0.6 ? 1.0 : 0.4] as [number,number,number]), 5300);
    return () => { clearInterval(i1); clearInterval(i2); clearInterval(i3); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setStarRotation(f => (f + 1) % 360), 166);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => { timer = setTimeout(() => { setBlinkOn(true); setTimeout(() => setBlinkOn(false), 120); schedule(); }, 15000 + Math.random() * 15000); };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => { timer = setTimeout(() => { setLed2On(v => !v); schedule(); }, 20000 + Math.random() * 20000); };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute transition-all duration-[2000ms]"
        style={{ left: "15%", top: "15%", width: "20%", height: "15%", backgroundColor: accent, opacity: monitors[0] * 0.15, borderRadius: 2 }} />
      <div className="absolute transition-all duration-[2000ms]"
        style={{ left: "40%", top: "12%", width: "22%", height: "18%", backgroundColor: accent, opacity: monitors[1] * 0.12, borderRadius: 2, transform: `rotate(${starRotation * 0.02}deg)` }} />
      <div className="absolute transition-all duration-[2000ms]"
        style={{ left: "68%", top: "15%", width: "18%", height: "15%", backgroundColor: accent, opacity: monitors[2] * 0.15, borderRadius: 2 }} />
      <div className="absolute pointer-events-none"
        style={{ left: "88%", top: "12%", width: 4, height: 4, backgroundColor: blinkOn ? "#ff4040" : "#552020", borderRadius: "50%", opacity: blinkOn ? 0.95 : 0.45, boxShadow: blinkOn ? "0 0 6px #ff4040" : "none", transition: "all 0.15s ease" }} />
      <div className="absolute pointer-events-none"
        style={{ left: "88%", top: "18%", width: 4, height: 4, backgroundColor: led2On ? "#40d080" : "#205040", borderRadius: "50%", opacity: led2On ? 0.85 : 0.4, boxShadow: led2On ? "0 0 5px #40d080" : "none", transition: "all 0.4s ease" }} />
      <CoffeeSteam accent="#d4a574" left="10%" top="55%" />
    </div>
  );
}

function SecurityAmbient({ accent }: { accent: string; intense?: boolean }) {
  const [radarAngle, setRadarAngle] = useState(0);
  const [camView, setCamView] = useState(0);
  const [alertFlash, setAlertFlash] = useState(false);
  const [terminalLine, setTerminalLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setRadarAngle(prev => (prev + 6) % 360), 66);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCamView(prev => (prev + 1) % 3), 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => { timer = setTimeout(() => { setAlertFlash(true); setTimeout(() => setAlertFlash(false), 320); schedule(); }, 20000 + Math.random() * 20000); };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTerminalLine(p => (p + 1) % 6), 1100);
    return () => clearInterval(interval);
  }, []);

  const camHues = [320, 200, 30];
  const TERM_LINES = ["SCAN: sector 7-G clear", "PING: hull integrity 99.8%", "SENS: thermal nominal", "AUTH: 0 pending requests", "FEED: cam-03 motion +0", "LINK: gateway stable"];

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute"
        style={{ left: "5%", top: "42%", width: "18%", height: "28%", background: `conic-gradient(from ${radarAngle}deg, transparent 0deg, ${accent}30 25deg, ${accent}10 55deg, transparent 70deg)`, borderRadius: "50%", opacity: 0.5, filter: `drop-shadow(0 0 4px ${accent}60)` }} />
      <div className="absolute rounded-full"
        style={{ left: "calc(5% + 9%)", top: "calc(42% + 14%)", width: 4, height: 4, marginLeft: -2, marginTop: -2, backgroundColor: accent, opacity: 0.8, animation: "ambient-pulse 2s ease-in-out infinite" }} />
      <div className="absolute transition-all duration-[1000ms]"
        style={{ left: "5%", top: "23%", width: "85%", height: "13%", filter: `hue-rotate(${camHues[camView]}deg)`, opacity: 0.15, backgroundColor: accent }} />
      <div className="absolute font-mono overflow-hidden"
        style={{ left: "26%", top: "46%", width: "42%", height: "10%", backgroundColor: "rgba(8,6,16,0.6)", border: `1px solid ${accent}30`, borderRadius: 2, fontSize: 6, lineHeight: 1.1, color: accent, padding: "2px 4px", opacity: 0.85 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ opacity: 0.5 + i * 0.18 }}>
            &gt; {TERM_LINES[(terminalLine + i) % TERM_LINES.length]}
          </div>
        ))}
      </div>
      {alertFlash && (
        <div className="absolute"
          style={{ left: "42%", top: "62%", width: 6, height: 6, backgroundColor: "#ff8000", borderRadius: "50%", boxShadow: "0 0 8px #ff8000" }} />
      )}
    </div>
  );
}

function WorkshopAmbient({ accent }: { accent: string; intense?: boolean }) {
  const [spark, setSpark] = useState(false);
  const [blueprintAngle, setBlueprintAngle] = useState(0);
  const [lightPulse, setLightPulse] = useState(0.4);
  const [printHead, setPrintHead] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => { timer = setTimeout(() => { setSpark(true); setTimeout(() => setSpark(false), 200); schedule(); }, 3000 + Math.random() * 5000); };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setBlueprintAngle(prev => (prev + 3) % 360), 166);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let dir = 1;
    const interval = setInterval(() => {
      setLightPulse(prev => {
        const next = prev + dir * 0.05;
        if (next >= 1.0) { dir = -1; return 1.0; }
        if (next <= 0.4) { dir = 1; return 0.4; }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let dir = 1;
    const interval = setInterval(() => {
      setPrintHead(prev => {
        const next = prev + dir * 1.5;
        if (next >= 100) { dir = -1; return 100; }
        if (next <= 0) { dir = 1; return 0; }
        return next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {spark && (
        <div className="absolute"
          style={{ left: "14%", top: "48%", width: 12, height: 12, backgroundColor: "#ffffff", borderRadius: "50%", boxShadow: `0 0 12px ${accent}, 0 0 24px ${accent}80`, opacity: 0.9 }} />
      )}
      <div className="absolute"
        style={{ left: "36%", top: "49%", width: "28%", height: "13%", background: `conic-gradient(from ${blueprintAngle}deg, transparent, ${accent}25, transparent)`, borderRadius: 4 }} />
      <div className="absolute"
        style={{ left: "5%", top: "37%", width: "90%", height: "3%", backgroundColor: accent, opacity: lightPulse * 0.3, borderRadius: 2 }} />
      <div className="absolute"
        style={{ left: "70%", top: "55%", width: "22%", height: "12%", border: `1px solid ${accent}40`, borderRadius: 2, backgroundColor: "rgba(8,18,24,0.45)", overflow: "hidden" }}>
        <div className="absolute top-0 bottom-0"
          style={{ left: `${printHead}%`, width: 3, marginLeft: -1.5, backgroundColor: accent, opacity: 0.8, boxShadow: `0 0 4px ${accent}` }} />
        <div className="absolute left-0 right-0 bottom-0"
          style={{ height: 2, backgroundColor: accent, opacity: 0.5 }} />
      </div>
    </div>
  );
}

function ArchiveAmbient({ accent }: { accent: string; intense?: boolean }) {
  const [lanterns, setLanterns] = useState([0.7, 0.5, 0.8]);
  const [dust, setDust] = useState(() => Array.from({ length: 5 }, (_, i) => ({ x: 15 + i * 18, y: 60 + (i % 3) * 15, seed: i })));
  const [crystalGlow, setCrystalGlow] = useState(false);
  const [bookOut, setBookOut] = useState(false);

  useEffect(() => {
    const intervals = lanterns.map((_, i) => {
      const speed = 2000 + i * 700;
      return setInterval(() => {
        setLanterns(prev => { const next = [...prev]; next[i] = 0.3 + seededRandom(Date.now() / speed + i * 100) * 0.7; return next; });
      }, speed);
    });
    return () => intervals.forEach(clearInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDust(prev => prev.map((p, i) => {
        const ny = p.y - 0.4;
        const nx = p.x + (seededRandom(Date.now() / 800 + i) - 0.5) * 0.4;
        return { ...p, x: nx, y: ny < -5 ? 100 : ny };
      }));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => { timer = setTimeout(() => { setCrystalGlow(true); setTimeout(() => setCrystalGlow(false), 500); schedule(); }, 5000 + Math.random() * 10000); };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => { timer = setTimeout(() => { setBookOut(true); setTimeout(() => setBookOut(false), 2200); schedule(); }, 18000 + Math.random() * 17000); };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const lanternPositions = [{ left: "17%", top: "41%" }, { left: "48%", top: "36%" }, { left: "78%", top: "42%" }];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {lanterns.map((brightness, i) => (
        <div key={`lantern-${i}`} className="absolute rounded-full"
          style={{ ...lanternPositions[i], width: 8, height: 8, backgroundColor: accent, opacity: brightness * 0.65, boxShadow: `0 0 ${6 + brightness * 10}px ${accent}${Math.round(brightness * 50).toString(16).padStart(2, "0")}`, transition: "opacity 0.4s ease, box-shadow 0.4s ease" }} />
      ))}
      {dust.map((p, i) => (
        <div key={`dust-${i}`} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: 2, height: 2, backgroundColor: accent, opacity: 0.3 + (i % 3) * 0.12, transition: "left 0.15s linear, top 0.15s linear" }} />
      ))}
      {crystalGlow && (
        <div className="absolute"
          style={{ left: "10%", top: "26%", width: "80%", height: "15%", backgroundColor: accent, opacity: 0.12, borderRadius: 4, boxShadow: `0 0 16px ${accent}40` }} />
      )}
      <div className="absolute"
        style={{ left: "62%", top: "44%", width: 6, height: 10, backgroundColor: accent, opacity: 0.7, borderRadius: 1, transform: `translateX(${bookOut ? 6 : 0}px)`, transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: bookOut ? `0 0 4px ${accent}80` : "none" }} />
    </div>
  );
}
