export interface TestItem {
  id: string;
  name: string;
  impact: number;
  status: "pending" | "running" | "passed" | "failed";
}

export interface GraphNode {
  id: string;
  group: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface AnalysisResult {
  impactedModules: string[];
  riskAssessment: string;
  suggestedTests: string[];
  confidenceScore: number;
  baseAgentFindings?: Array<{
    agent: string;
    finding: string;
  }>;
  customAgentFindings?: Array<{
    agent: string;
    finding: string;
  }>;
}

export interface UserConfig {
  customAgents: string[];
}

export interface ReleaseAnalysis {
  analysis: AnalysisResult;
  graphData: GraphData;
  riskScore: number;
  prioritizedTests: TestItem[];
  recommendation: string;
  timestamp: string;
}
