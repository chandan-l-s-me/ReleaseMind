# ReleaseMind

ReleaseMind is an AI-assisted release intelligence dashboard for engineering teams. It analyzes a public GitHub repository or pull request, combines that live GitHub context with your notes, and produces a release report with risk scoring, dependency impact, prioritized tests, and agent-based findings.

This project is built as a React + Vite frontend with an Express + Socket.IO backend and a Gemini-powered analysis layer, with local fallback analysis when Gemini is unavailable.

## What It Does

ReleaseMind helps answer questions like:

- What parts of the system are impacted by this change?
- How risky is this release?
- Which tests should be run first?
- Should the team do a full release, a canary release, or block the rollout?
- What do the core agents think about the release from different perspectives?

The app is designed around a multi-agent release workflow:

- `Code Context Agent`
- `Dependency Graph Agent`
- `Risk Prediction Agent`
- `Test Prioritization Agent`
- `Release Decision Agent`

It also supports user-defined custom agents whose findings are displayed in the dashboard.

## Current Features

- Public GitHub repository URL support
- Public GitHub pull request URL support
- Repository file ingestion from GitHub
- PR patch and changed-file context fetching
- Gemini-based structured release analysis
- Local fallback analysis when Gemini is unavailable
- Risk score with live recommendation updates
- Prioritized test simulation with interactive score reduction
- Dependency impact graph visualization
- Core agent findings display
- Custom agent findings display
- Google and email authentication via Firebase
- Real-time collaborative room state with Socket.IO
- Analysis history saved to Firestore for signed-in users

## How Analysis Works

### 1. Input

The user can provide:

- a public GitHub repository URL
- a public GitHub PR URL
- additional change notes or manual context

### 2. GitHub Context Fetching

The backend parses the GitHub URL and fetches live data from the GitHub API.

For a public repository URL, ReleaseMind fetches:

- repository metadata
- recent commits
- README content
- a prioritized set of readable source/config/docs files

For a public PR URL, ReleaseMind fetches:

- PR metadata
- changed files
- patch excerpts
- repository files from the PR head/default branch

This happens in [server.ts](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/server.ts:1).

### 3. AI / Fallback Analysis

The aggregated GitHub context is passed into [src/services/geminiService.ts](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/src/services/geminiService.ts:1).

If a Gemini API key is available, the app requests structured output including:

- impacted modules
- detailed risk assessment
- prioritized tests
- graph nodes and links
- core agent findings
- custom agent findings

If Gemini is unavailable or fails, ReleaseMind falls back to a local heuristic analysis so the dashboard still works.

### 4. Dashboard Output

The dashboard presents:

- risk score
- release recommendation
- dependency impact graph
- prioritized tests
- what-if simulation
- core agent findings
- custom agent findings

## Recommendation Logic

Recommendations are based on risk score thresholds:

| Risk Score | Recommendation |
| ---------- | -------------- |
| 0-40       | Full Release   |
| 41-70      | Canary Release |
| 71-100     | Block Release  |

The dashboard recommendation updates from the current displayed risk score, including the what-if test simulation.

## Core Agents

The shared base-agent definition lives in [src/lib/agents.ts](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/src/lib/agents.ts:1).

### Code Context Agent

Analyzes semantic code changes and identifies the most affected modules.

### Dependency Graph Agent

Maps dependency propagation and blast radius across connected services.

### Risk Prediction Agent

Assesses security, stability, and performance risk for the release.

### Test Prioritization Agent

Selects the highest-impact tests to run before release.

### Release Decision Agent

Recommends full release, canary release, or blocking the rollout.

## Custom Agents

Users can add custom agent personas from the dashboard settings modal.

Custom agents:

- are saved in Firestore user config
- are injected into the Gemini prompt
- return visible findings in the `Custom Agent Findings` section

If fallback mode is active, the dashboard still shows a note for each custom agent explaining that no model-generated finding was produced.

## GitHub Support

ReleaseMind currently supports:

- public repositories
- public pull requests

It does not currently support:

- private repository analysis via OAuth/App installation
- full repository cloning
- unlimited file ingestion for very large repos

To keep analysis practical, the backend reads a capped number of prioritized text files and truncates large contexts before sending them to the model.

## Rate Limiting

Public GitHub repositories can still hit GitHub API rate limits if the server is calling the API without authentication.

To improve GitHub API reliability, add a `GITHUB_TOKEN` in your environment:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

The server now returns clearer GitHub errors for:

- rate limiting
- missing resources
- invalid credentials

## Authentication

Authentication is handled with Firebase.

Current supported sign-in methods in the app:

- Google
- Email / Password

GitHub login has been removed from the auth flow.

## Tech Stack

Frontend:

- React 19
- Vite
- TypeScript
- Motion
- Recharts
- D3
- Tailwind

Backend:

- Node.js
- Express
- Socket.IO

AI:

- Google Gemini via `@google/genai`

Auth / Data:

- Firebase Authentication
- Firestore

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Create [ReleaseMind/.env](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/.env:1) with the keys you need:

```env
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
```

Notes:

- `GEMINI_API_KEY` / `VITE_GEMINI_API_KEY` enable model-backed analysis
- without Gemini, the app uses fallback analysis
- `GITHUB_TOKEN` is strongly recommended for GitHub API reliability

### 3. Run the app

```bash
npm run dev
```

The app runs through [server.ts](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/server.ts:1), which starts the Express server and mounts Vite middleware in development.

### 4. Type check

```bash
npm run lint
```

## Project Structure

Important files:

- [server.ts](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/server.ts:1)
  Express server, Socket.IO setup, GitHub context fetching
- [src/services/geminiService.ts](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/src/services/geminiService.ts:1)
  AI and fallback release analysis
- [src/services/githubService.ts](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/src/services/githubService.ts:1)
  Frontend client for GitHub context API calls
- [src/components/Dashboard.tsx](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/src/components/Dashboard.tsx:1)
  Main analysis UI and simulation flow
- [src/lib/agents.ts](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/src/lib/agents.ts:1)
  Shared base-agent definitions
- [src/firebase.ts](/Users/chandanls/Desktop/ReleaseMind/ReleaseMind/src/firebase.ts:1)
  Firebase initialization

## Known Constraints

- Only public GitHub repo/PR analysis is supported right now
- Large repositories are sampled and truncated for model size limits
- Fallback analysis is heuristic and more conservative than Gemini output
- Real GitHub private-repo support would require additional auth and permission design

## Summary

ReleaseMind is no longer just a static concept demo. It now performs real public GitHub context ingestion, displays core and custom agent findings, supports collaborative release analysis, and produces actionable release recommendations with a resilient fallback path when AI is unavailable.
