---
name: Mission Control sim activity
description: How the ambient activity simulator works and why it exists.
---

# Activity Simulator

**Rule:** The visual demo must look alive even when zero real backend tasks exist. `useActivitySim` generates random per-agent task counts that change every 7–16 s.

**Why:** The API server often returns `tasksActive: 0` for all agents. Without simulation, every room shows idle state and the station looks dead.

**How to apply:**  
- In `Dashboard.tsx`, call `useActivitySim()` and compute `agentTasks[id] = Math.max(live?.tasksActive ?? 0, sim.tasks[id])`.
- This means real tasks always win if present; sim provides a floor so rooms always show some activity.
- `TaskPacketLayer` uses a ref to track previous counts and fires a packet whenever a count increases — this naturally fires on both sim changes and real task arrivals.
