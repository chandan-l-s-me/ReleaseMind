import { GoogleGenAI, Type } from "@google/genai";
import { ReleaseAnalysis } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "MISSING_KEY") {
      console.warn("GEMINI_API_KEY is missing. AI analysis features will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function analyzeRelease(repoUrl: string, diff: string, customAgents: string[] = []): Promise<ReleaseAnalysis> {
  try {
    const ai = getAI();
    if (!ai) {
      throw new Error("Gemini API Key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
    }
    const model = "gemini-3-flash-preview";
    
    const baseAgents = [
      "Architect Agent: Analyzes structural dependencies and impacted modules.",
      "Security Agent: Identifies potential security risks or vulnerabilities in the changes.",
      "QA Agent: Prioritizes testing strategies based on change impact."
    ];

    const allAgents = [...baseAgents, ...customAgents];
    
    const systemInstruction = `You are ReleaseMind, a multi-agent AI system for CI/CD intelligence.
    Your analysis consists of specialized agents:
    ${allAgents.map((a, i) => `${i + 1}. ${a}`).join("\n")}
    
    Provide a unified, high-confidence analysis of the provided code changes.`;

    const prompt = `Analyze the following release context:
    Repository: ${repoUrl}
    Code Changes/Diff: ${diff}
    
    Identify:
    - The specific modules or services impacted.
    - A detailed risk assessment (Security, Stability, Performance).
    - A list of prioritized tests to run.
    - A dependency graph representing how these changes propagate.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            impactedModules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of services or modules affected by the change."
            },
            riskAssessment: {
              type: Type.STRING,
              description: "Detailed reasoning from the Security and Architect agents."
            },
            riskScore: {
              type: Type.NUMBER,
              description: "A calculated risk score from 0 to 100."
            },
            suggestedTests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  impact: { type: Type.NUMBER, description: "0-100 impact of this test on confidence." }
                },
                required: ["name", "impact"]
              }
            },
            graphNodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["impacted", "dependency"] }
                },
                required: ["id", "type"]
              }
            },
            graphLinks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING }
                },
                required: ["source", "target"]
              }
            }
          },
          required: ["impactedModules", "riskAssessment", "riskScore", "suggestedTests", "graphNodes", "graphLinks"]
        }
      },
    });

    const data = JSON.parse(response.text || "{}");

    // Map to our internal type structure
    const prioritizedTests = data.suggestedTests.map((test: any, i: number) => ({
      id: `test-${i}`,
      name: test.name,
      impact: test.impact,
      status: "pending"
    })).sort((a: any, b: any) => b.impact - a.impact);

    const graphData = {
      nodes: data.graphNodes.map((n: any) => ({ id: n.id, group: n.type === "impacted" ? 1 : 2 })),
      links: data.graphLinks.map((l: any) => ({ source: l.source, target: l.target, value: 5 }))
    };

    let recommendation = "Full Release";
    if (data.riskScore > 70) recommendation = "Block Release";
    else if (data.riskScore > 40) recommendation = "Canary Release";

    return {
      analysis: {
        impactedModules: data.impactedModules,
        riskAssessment: data.riskAssessment,
        suggestedTests: data.suggestedTests.map((t: any) => t.name),
        confidenceScore: 100 - data.riskScore
      },
      graphData,
      riskScore: data.riskScore,
      prioritizedTests,
      recommendation,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Gemini Analysis error:", error);
    throw new Error("Failed to analyze release with AI. Please check your input and try again.");
  }
}
