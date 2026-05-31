export const SPACE_FACTS = [
  "The ISS travels at 28,000 km/h and orbits Earth every 92 minutes.",
  "Neutron stars can spin at up to 716 rotations per second.",
  "The Voyager 1 probe is over 24 billion km from Earth and still transmitting.",
  "A day on Venus is longer than its year — 243 Earth days vs 225.",
  "The Milky Way's central black hole is 4 million times the mass of our Sun.",
  "Light from the Sun takes 8 minutes 20 seconds to reach Earth.",
  "The James Webb Space Telescope can see objects 13.5 billion light-years away.",
  "There are more stars in the universe than grains of sand on all Earth's beaches.",
  "Saturn's moon Titan has lakes of liquid methane and ethane.",
  "The hottest planet in our solar system is Venus, at 465°C surface temperature.",
];

export const COMMENTS: Record<string, string[]> = {
  monkey: [
    "Mission parameters confirmed. All systems nominal.",
    "Reviewing queue priorities for optimal dispatch.",
    "Coordinating cross-station workflow adjustments.",
    "Monitoring agent activity across all decks.",
    "Analyzing recent incident patterns for improvements.",
  ],
  lifesupport: [
    "All vital signs within normal parameters.",
    "Running preventive maintenance on sensor array.",
    "Calibrating environmental monitoring systems.",
    "Health check complete — no anomalies detected.",
    "Optimizing power distribution across modules.",
  ],
  engineer: [
    "Systems Engineer has consumed dangerous amounts of coffee.",
    "Optimizing build pipeline for faster deployment.",
    "New integration tests passing — ready for production.",
    "Refactoring legacy components for better reliability.",
    "Deploying hotfix to production environment.",
  ],
  archivist: [
    "Archivist is reorganising memory sectors.",
    "Indexing new knowledge base entries.",
    "Cross-referencing historical incident data.",
    "Consolidating fragmented memory into unified index.",
    "Archiving completed mission logs for long-term storage.",
  ],
};

export const STATION_CHATTER = [
  "Station quiet. Crew currently undefeated at zero-gravity cards.",
  "Research deck lights still on at 02:14.",
  "Automated backup completed without errors.",
  "All station modules reporting nominal status.",
  "External sensor array calibrated and ready.",
  "Incoming telemetry from fleet — processing now.",
  "Coffee reserves at 43%. Engineer refill required.",
  "Night shift rotation in 3 hours. All hands rested.",
  "Station time synchronization complete. All clocks aligned.",
  "Micro-meteorite detection systems nominal. No impacts.",
];

export function getRotationFact(index: number): string {
  return SPACE_FACTS[index % SPACE_FACTS.length];
}

export function getRandomComment(crewId: string): string {
  const comments = COMMENTS[crewId] || COMMENTS.monkey;
  return comments[Math.floor(Math.random() * comments.length)];
}

export function getRandomChatter(): string {
  return STATION_CHATTER[Math.floor(Math.random() * STATION_CHATTER.length)];
}
