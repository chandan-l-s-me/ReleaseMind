export interface AgentDefinition {
  name: string;
  description: string;
}

export const BASE_AGENTS: AgentDefinition[] = [
  {
    name: "Code Context Agent",
    description: "Analyzes semantic code changes and identifies the most affected modules."
  },
  {
    name: "Dependency Graph Agent",
    description: "Maps dependency propagation and blast radius across connected services."
  },
  {
    name: "Risk Prediction Agent",
    description: "Assesses security, stability, and performance risk for the release."
  },
  {
    name: "Test Prioritization Agent",
    description: "Selects the highest-impact tests to run before release."
  },
  {
    name: "Release Decision Agent",
    description: "Recommends full release, canary release, or blocking the rollout."
  }
];
