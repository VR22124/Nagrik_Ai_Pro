# Security Hardening & Safe Scaling

NagrikAI Pro is built to process requests safely across public domains mapping to zero-trust principles.

## Input Validation & Sanitization
* Every JSON request hitting the Express server is first piped through `validationRequest.middleware.js`.
* Constraints are strictly mapped using `Joi`.
* **XSS Stripping**: Input values are scrubbed against malicious `<script>` boundaries preventing payload injection entirely native to the validation cycle.

## Deep Rate Limiting
* **Global Pipeline**: Standard limits enforce API stability using memory-window buckets checking IPs natively.
* **AI Token Bucketing**: A dedicated, isolated strict interceptor exists explicitly for `/api/gemini/explain` and `/chat`. The backend forces a hard cap of 5 executions per minute, preventing malicious exhaustion of the Gemini Cloud project quota.

## Execution Headers
* **CORS**: Completely whitelisted. ONLY the authorized React URLs (`localhost:5173`, `.web.app`, `.onrender.com`) are allowed past Preflight Origin evaluations natively blocking foreign domain scraping.
* **Helmet**: Enforces rigid HTTP response headers natively.

## Data Safety
No underlying persistent database (SQL/NoSQL) stores active user Personally Identifiable Information (PII). All calculations are completely stateless mapping local contexts out.
