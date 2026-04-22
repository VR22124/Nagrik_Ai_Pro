# Security Implementation

NagrikAI Pro is built with a "Privacy First" and "Defense in Depth" philosophy. Given the nature of electoral data, security is paramount.

## 1. No PII Stored
The system is explicitly designed to **never** request, process, or store Personally Identifiable Information (PII) such as:
* Voter ID Numbers (EPIC)
* Aadhar Numbers
* Phone Numbers
* Email Addresses
* Full Names

All scenarios and intents are anonymized before hitting the backend.

## 2. Firebase Security Rules
While user sessions are stored in Firestore to allow journey resumption, the database is locked down. We use Firebase Anonymous Auth to generate a UID.
The `firestore.rules` file strictly enforces that users can only read or write to their specific document:

```javascript
match /user_sessions/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```
This entirely mitigates mass-scraping or cross-session data leaks.

## 3. Strict CORS Policies
The backend Express server does not use wildcard `*` CORS origins. The `CORS_ORIGINS` environment variable explicitly maps to known, trusted frontend domains (e.g., `http://localhost:5173`, `https://nagrik-ai-pro.web.app`). Requests from unauthorized domains are blocked at the middleware layer.

## 4. API Rate Limiting
To protect against Denial of Service (DoS) attacks and to prevent abuse of our Gemini API quota, the backend utilizes `express-rate-limit`. 
* Standard endpoints allow 120 requests per minute.
* AI-specific endpoints (`/gemini/*`) are strictly limited to 15 requests per minute per IP.

## 5. Request Validation & Sanitization
Every backend route is protected by `express-validator` middleware:
* **Size Limits**: `express.json({ limit: "80kb" })` prevents payload stuffing.
* **Type Checking**: Inputs are strictly validated against expected Enums.
* **XSS Protection**: Open-ended text inputs (like the "intent" field) are sanitized. HTML tags (`<`, `>`) are actively stripped before reaching the Gemini wrapper to prevent prompt injection.

## 6. Secure Gemini Access
The `GEMINI_API_KEY` never touches the frontend. All AI interactions run through the Node.js backend. This prevents key exfiltration from the browser's network inspector. Furthermore, the backend is configured to hard-crash on startup if the key is missing in production, preventing silent failures.
