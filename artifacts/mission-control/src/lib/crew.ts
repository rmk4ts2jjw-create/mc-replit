import monkeyIdle from "@/assets/sprite-monkey-idle-4x-v2.png";
import monkeyWorking from "@/assets/sprite-monkey-working-4x-v2.png";
import monkeyWalking from "@/assets/sprite-monkey-walking-4x-v2.png";
import lifesupportIdle from "@/assets/sprite-lifesupport-idle-4x-v2.png";
import lifesupportWorking from "@/assets/sprite-lifesupport-working-4x-v2.png";
import lifesupportWalking from "@/assets/sprite-lifesupport-walking-4x-v2.png";
import engineerIdle from "@/assets/sprite-engineer-idle-4x-v2.png";
import engineerWorking from "@/assets/sprite-engineer-working-4x-v2.png";
import engineerWalking from "@/assets/sprite-engineer-walking-4x-v2.png";
import archivistIdle from "@/assets/sprite-archivist-idle-4x-v2.png";
import archivistWorking from "@/assets/sprite-archivist-working-4x-v2.png";
import archivistWalking from "@/assets/sprite-archivist-walking-4x-v2.png";

export type CrewStatus = "active" | "standby" | "ondemand" | "error";

export interface Sprites {
  idle: string;
  working: string;
  walking: string;
}

export interface CrewMember {
  id: string;
  emoji: string;
  name: string;
  role: string;
  shortRole: string;
  description: string;
  model: string;
  mode: "Always ON" | "ON-DEMAND";
  status: CrewStatus;
  avatar: string;
  sprites: Sprites;
  accent: "violet" | "pink" | "cyan" | "warning";
}

export const CREW: CrewMember[] = [
  {
    id: "monkey",
    emoji: "🐒",
    name: "Space Monkey",
    role: "Mission Director",
    shortRole: "Top-level Orchestrator",
    description: "Top-level orchestrator and decision-maker. Routes work to the crew, owns the task queue, and keeps the mission on course.",
    model: "claude-sonnet-4-6",
    mode: "Always ON",
    status: "active",
    avatar: monkeyIdle,
    sprites: { idle: monkeyIdle, working: monkeyWorking, walking: monkeyWalking },
    accent: "violet",
  },
  {
    id: "lifesupport",
    emoji: "🥷🏽",
    name: "Life Support Officer",
    role: "Infrastructure Controller",
    shortRole: "Infra & Health",
    description: "Watches system health, runs guardrails, and keeps everything rollback-ready. Quiet patrol of the station at all hours.",
    model: "claude-sonnet-4-6",
    mode: "Always ON",
    status: "active",
    avatar: lifesupportIdle,
    sprites: { idle: lifesupportIdle, working: lifesupportWorking, walking: lifesupportWalking },
    accent: "pink",
  },
  {
    id: "engineer",
    emoji: "🔧",
    name: "Systems Engineer",
    role: "Coder / Builder",
    shortRole: "Scripts & Deploys",
    description: "Writes scripts, edits configs, ships deployments, automates repetitive ops. Wakes up when there is something to build.",
    model: "claude-sonnet-4-6",
    mode: "ON-DEMAND",
    status: "ondemand",
    avatar: engineerIdle,
    sprites: { idle: engineerIdle, working: engineerWorking, walking: engineerWalking },
    accent: "cyan",
  },
  {
    id: "archivist",
    emoji: "📚",
    name: "Station Archivist",
    role: "Memory & Knowledge",
    shortRole: "Logs & Patterns",
    description: "Maintains the ship's log, consolidates daily memory, and surfaces patterns from institutional history.",
    model: "claude-sonnet-4-6",
    mode: "ON-DEMAND",
    status: "ondemand",
    avatar: archivistIdle,
    sprites: { idle: archivistIdle, working: archivistWorking, walking: archivistWalking },
    accent: "warning",
  },
];

export const getCrew = (id: string) => CREW.find((c) => c.id === id);
