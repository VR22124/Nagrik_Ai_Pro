# Application Programming Interface (API)

All endpoints utilize `application/json` interfaces and are prefixed with `/api`.

---

## POST /api/guidance/generate
Evaluates user context and computes a full deterministic navigation response.

**Request Body:**
```json
{
  "age": 22,
  "state": "Tamil Nadu",
  "registrationStatus": "not_registered",
  "hasAddressProof": true,
  "scenario": "first_time",
  "movedRecently": false,
  "intent": ""
}
```

**Response Structure (200 OK):**
```json
{
  "userStatus": ["Age: 22", "Resolved scenario: first_time", "You are eligible..."],
  "requiredActions": ["Start registration using Form 6", "Follow official flow..."],
  "documentsNeeded": ["Passport/Birth Certificate", "Current permanent address...", "Passport size photograph"],
  "importantDeadlines": [...],
  "nextSteps": [...],
  ...
}
```

**Validation Rules:** Age must be strict numeric. Statuses strictly ENUM parsed.

---

## POST /api/eligibility
Evaluates pure legal viability mapping constraints instantly. 

**Request Body:**
```json
{
  "age": 17,
  "state": "Tamil Nadu",
  "registrationStatus": "not_registered"
}
```
**Response:**
Returns partial guidance evaluation arrays natively truncating downstream rules if ineligible.

---

## GET /api/scenarios
Retrieves system-supported configuration maps for frontend dropdown structures.

---

## POST /api/gemini/explain
Routes complex guidance objects into Gemini for simplification.
**Request Body:** `{ "response": { ...guidancePayload }, "userContext": { ... } }`
**Response:** `{ "text": "A simplified 90-word summary of the rules." }`
**Constraint:** Max 5 requests/minute per IP.

---

## POST /api/gemini/chat
Routes contextual questions into Gemini safely grounded in JSON rules.
**Request Body:** `{ "message": "Can I use my college ID?", "userContext": {}, "guidance": {} }`
**Response:** `{ "text": "No, college IDs are generally not accepted for voter registration in this flow..." }`
**Constraint:** Max 5 requests/minute per IP.
