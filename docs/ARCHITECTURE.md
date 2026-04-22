# Architecture

## Folder Structure
The repository is split into two distinct workspaces (monorepo style) to enforce separation of concerns:

```text
Nagrik_AI_Pro/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI elements (flow, chat, common)
│   │   ├── services/       # API integrations (guidanceApi, geminiApi, firebase)
│   │   └── utils/          # Frontend helpers and string truncators
│   ├── firestore.rules     # Firebase security configuration
│   └── vite.config.js      # Frontend bundler settings
└── server/                 # Node.js backend API
    ├── src/
    │   ├── config/         # Environment mapping (env.js)
    │   ├── controllers/    # Route handlers bridging HTTP to services
    │   ├── data/           # Static config, caching, and state mappings
    │   ├── middlewares/    # Request validation, rate limiting
    │   ├── routes/         # Express router definitions
    │   └── services/       # Core business logic (Rules engine, Gemini wrappers)
    └── tests/              # Native Node.js test suites (unit/integration)
```

## Data Flow
The system operates on a unidirectional request-response flow designed for maximum predictability:
1. **User Input**: The citizen fills out a simple form on the React frontend.
2. **Backend Engine**: The payload is sent to `/api/guidance/generate`. 
3. **Deterministic Evaluation**: The backend `electionLogic.service` evaluates the context (Age, State, Scenario) against hardcoded ECI rules.
4. **Structured Response**: A strict JSON object containing `userStatus`, `requiredActions`, `documentsNeeded`, and `warnings` is returned.
5. **UI Rendering**: The React app paints the UI components (`NextBestAction`, `DoThisNow`) based directly on the JSON payload.
6. **AI Enhancement**: If the user clicks "Explain Simply", the frontend queries the `/api/gemini/explain` endpoint, which wraps the structured guidance into a prompt for Gemini to summarize.

## Separation of Concerns
The backend strictly adheres to an MVC-like service architecture:
* **Routes**: Define the endpoints (`gemini.routes.js`, `guidance.routes.js`).
* **Controllers**: Extract the HTTP request body and send responses. No business logic lives here.
* **Services**: The brains of the operation. Contains the `RulesEngine` and Google Gemini REST API fetchers.
* **Middlewares**: `express-validator` blocks malformed requests before they hit controllers. Rate limiters prevent abuse.

## Why Deterministic Engine + AI Hybrid?
Electoral guidance is highly sensitive. If an AI hallucinates an incorrect deadline or form number, a citizen could lose their right to vote. 

To prevent this, NagrikAI Pro uses a **Hybrid Architecture**:
1. **The Core is Deterministic**: Hardcoded rules calculate eligibility, forms (Form 6, Form 8), and document requirements. This guarantees 100% legal accuracy.
2. **The AI is the Explanation Layer**: Gemini is only invoked *after* the deterministic payload is created. It receives the rigid rules as context and is tasked purely with translating them into empathetic, easy-to-understand language.
