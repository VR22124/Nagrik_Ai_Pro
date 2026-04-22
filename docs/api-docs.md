# API Documentation

The Node.js backend exposes a stateless, RESTful API. All endpoints expect `application/json`.

## 1. POST /api/guidance/generate

**Purpose**: The core deterministic rules engine. Evaluates citizen context against ECI rules and returns actionable steps.

**Request Body**:
```json
{
  "age": 22,
  "state": "Tamil Nadu",
  "registrationStatus": "not_registered",
  "scenario": "first_time_migrated",
  "hasAddressProof": false,
  "movedRecently": true,
  "migrationType": "inter_state",
  "intent": "I moved to Chennai for college and need help"
}
```

**Response (200 OK)**:
```json
{
  "eligibilityStatus": "ELIGIBLE",
  "userStatus": [
    "You are a first-time voter who has migrated between states.",
    "Tamil Nadu + English support is commonly preferred for first-time users."
  ],
  "requiredActions": [
    "Submit Form 6 for fresh inclusion in the electoral roll in your new constituency."
  ],
  "documentsNeeded": [
    "Age Proof (e.g., Birth Certificate, PAN Card)",
    "Address Proof (e.g., Aadhar, utility bill at current residence)"
  ],
  "importantDeadlines": "Ensure submission before the final roll publication.",
  "warnings": [
    "Since you lack current address proof, request a letter from your hostel warden or utilize your rental agreement."
  ]
}
```

## 2. POST /api/gemini/explain

**Purpose**: Wraps the deterministic guidance payload and translates it into simple language using Google Gemini.

**Request Body**:
```json
{
  "response": { /* Full JSON payload from /api/guidance/generate */ },
  "userContext": {
    "age": 22,
    "state": "Tamil Nadu",
    "registrationStatus": "not_registered"
  }
}
```

**Response (200 OK)**:
```json
{
  "text": "Since you're 22 and living in Tamil Nadu for college, you just need to fill out Form 6 online to register for the first time. Even without standard address proof, a letter from your hostel works fine!"
}
```

## 3. POST /api/gemini/chat

**Purpose**: Context-aware chatbot endpoint that answers specific questions grounded *only* in the current registration scenario.

**Request Body**:
```json
{
  "message": "Where do I submit Form 6?",
  "userContext": { "state": "Tamil Nadu" },
  "guidance": { /* Full guidance JSON */ }
}
```

**Response (200 OK)**:
```json
{
  "text": "You can submit Form 6 completely online via the official Voters' Services Portal (voters.eci.gov.in). Alternatively, you can drop it off physically at the local Electoral Registration Office in your city."
}
```

## 4. POST /api/gemini/maps-explain

**Purpose**: Dynamically evaluates the user's situation to generate a highly specific, localized Google Maps search query for nearby electoral facilities.

**Request Body**:
```json
{
  "state": "Tamil Nadu",
  "intent": "I moved to Chennai for college",
  "registrationStatus": "not_registered",
  "nextBestAction": "Submit Form 6"
}
```

**Response (200 OK)**:
```json
{
  "searchQuery": "Electoral Registration Office Chennai Tamil Nadu",
  "reasoning": "Since you need to submit Form 6 physically, you must visit the ERO."
}
```
