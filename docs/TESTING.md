# Testing Suite

NagrikAI Pro maintains rigorous test coverage to ensure that deterministic electoral logic is never compromised.

## How to Run Tests

### Backend Tests (Node Native)
The backend uses the modern, lightning-fast Node.js Native Test Runner (`node:test`).
```bash
cd server
npm test
```
*Current Coverage: 44/44 tests passing.*

### Frontend Tests (Vitest)
The frontend uses Vitest and React Testing Library to test component utilities in a simulated browser (JSDOM) environment.
```bash
cd client
npm test
```

## What is Covered?

### 1. Deterministic Election Logic (Unit Tests)
Validates that the rules engine outputs the exact correct forms and requirements for age boundaries, states, and migration vectors.
* *Example*: `eligibility returns false for age < 18`
* *Example*: `maps Form 6 for unregistered migrants`

### 2. Request Validation (Middleware Tests)
Ensures the backend properly rejects malformed payloads and malicious inputs.
* *Example*: `scenario validation strips HTML injection tags (XSS check)`
* *Example*: `eligibility validation rejects invalid age boundaries`

### 3. End-to-End Workflow (Integration Tests)
Simulates a full network POST request passing through Express routers, middlewares, and services to ensure the structured JSON is perfectly formed.
* *Example*: `executes the full primary AI flow (form input -> complete structured guidance)`

### 4. API Provider Degradation (Edge Tests)
Validates that the system falls back gracefully if Google Gemini goes down.
* *Example*: `/api/gemini/chat recovers cleanly on LLM provider failure (returns 200 with null text)`

## Known Limitations
* We do not currently mock Firebase Auth in frontend component tests.
* E2E tests mock the Google Gemini network boundary to prevent API quota drain during CI runs.
