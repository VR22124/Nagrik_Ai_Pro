# Testing Strategy and Methodologies

NagrikAI heavily executes native Node testing (utilizing `node:test` natively shipping with modern V20 Node runtimes). The philosophy focuses heavily on deterministic boundaries and edge-case catching.

## 1. Unit Tests (Validation Edge Cases)
The `validateRequest.middleware.test.js` structure evaluates security boundary logics completely bypassing business engine layers:
* Validates missing properties map accurately back resolving `422 Unprocessable Entities`.
* Evaluates explicitly malicious XSS structural bypass injections (script payload tests).

## 2. Integration / Edge Cases (Gemini API)
Because Gemini is heavily integrated through `/api/gemini/explain` endpoints natively, integration tests evaluate connection errors.
* `gemini.explain.edge.test.js` validates timeout fallbacks and HTTP `500` loops locally. It prevents frontend React crash loops in the event that the Google API Cloud quota expires explicitly.

## 3. End-to-End Core Logic Flow (E2E)
The `e2e.flow.test.js` engine maps a fully synthesized logic sequence strictly generating exact JSON configurations exactly matching frontend behaviors mimicking form inputs from origin to conclusion.

## Execution
```bash
cd server
npm test
```
