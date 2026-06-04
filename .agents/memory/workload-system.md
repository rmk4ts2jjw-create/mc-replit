---
name: Mission Control workload system
description: How WorkloadLevel flows through the component tree and drives visual effects.
---

# WorkloadLevel System

**Rule:** All dynamic room visuals (border glow, animation speed, canvas overlays, ambient effects) are driven by `WorkloadLevel` — never by individual boolean props.

**Flow:**  
`useActivitySim` (Dashboard) → `agentTasks` → `tasksToLevel()` → `workloadLevel` prop →  
`AgentOffice` → `StationRoom` → `RoomCanvas` + `RoomAmbient`

**Why:** Centralising the level means every visual layer stays in sync. A single source of truth prevents, e.g., a fast radar with a calm border glow.

**How to apply:**  
- `RoomCanvas` uses `levelRef` pattern (ref updated on every render, read inside the interval callback) — this avoids restarting the animation loop on every level change.
- `RoomAmbient` restarts effect intervals when `workloadLevel` changes (it's in deps arrays) to get the new timer speed.
- Border colours must be `rgba()` or `hsl()` — never `oklch()` — because they appear in inline styles where oklch may not be supported.

**Level → colour map (inline styles only):**  
- critical: `rgba(255,60,40,…)`  
- heavy: `rgba(255,140,0,…)`  
- medium: `rgba(130,100,255,…)`  
- light: `rgba(100,140,255,…)`
