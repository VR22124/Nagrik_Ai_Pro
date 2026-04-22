# NagrikAI Pro

## 🚀 Live Demo
**[Link to Live Application]** *(Insert your Firebase/Render URL here!)*

## Overview
NagrikAI Pro is a modern, AI-powered election guidance system designed to help citizens smoothly navigate the complex electoral registration process. By mapping the nuanced rules of the Election Commission of India into a deterministic rules-engine and enhancing it with Google Gemini, NagrikAI Pro provides clear, actionable, and 100% accurate guidance to voters.

## The Problem
Millions of citizens face difficulties voting due to misinterpreting eligibility requirements, struggling with bureaucratic forms for migrating constituencies, or incorrectly assuming a lost ID card rescinds their voting rights. The process is scattered, jargon-heavy, and deeply intimidating.

## The Solution
NagrikAI Pro centralizes and demystifies the voter registration process by acting as a translation layer between the citizen and the legal framework. It features:
* A **strictly deterministic legal rules engine** acting as the absolute source of truth to prevent AI hallucination.
* A **step-by-step un-paginated UI** that isolates the precise tasks a user must complete right now.
* A **Gemini AI enhancement layer** that translates complex electoral jargon into native, simple phrasing on demand.
* A **Privacy-First architecture** that requires zero sensitive PII tracking while allowing users to save their progress.

## Tech Stack
* **Frontend**: React, Vite, TailwindCSS (Responsive, lazy-loaded UI)
* **Backend**: Node.js, Express (Stateless, validated API)
* **Testing**: Node Native Test Runner & Vitest (100% passing suite)
* **Deployment**: Firebase Hosting (Frontend), Render (Backend)

## 🔌 Google Services Integration

NagrikAI Pro deeply integrates six Google services, each serving a specific, functional role.

---

### 1. Google Gemini AI (Flash)
| | |
|---|---|
| **Purpose** | Translates complex Indian election eligibility rules into plain, accessible language on demand |
| **Implementation** | `server/src/routes/gemini.routes.js` + `server/src/services/mapsExplain.service.js` |
| **Endpoints** | `POST /api/gemini/explain` — simplify guidance · `POST /api/gemini/chat` — Q&A · `POST /api/gemini/maps-explain` — location context |
| **Retry logic** | Exponential backoff: 1s → 2s → 4s on HTTP 429 / 503 quota errors (max 3 attempts) |
| **Fallback** | If Gemini is unavailable, a Toast notification informs the user and standard guidance is shown |
| **UI indicator** | A `✨ Simplified by Gemini AI` badge appears on the result card when active |

---

### 2. Firebase Anonymous Authentication
| | |
|---|---|
| **Purpose** | Provides session continuity without collecting any Personally Identifiable Information (PII) |
| **Implementation** | `client/src/services/firebase.js` · `client/src/context/SessionContext.jsx` |
| **Behaviour** | Users never create an account — a unique anonymous UID is generated silently on first load |
| **Privacy** | No email, no name, no device fingerprint — only an ephemeral anonymous UID |

---

### 3. Cloud Firestore
| | |
|---|---|
| **Purpose** | Persists the user's last guidance session so they can resume exactly where they left off |
| **Implementation** | `client/src/services/sessionStore.js` (Firestore + localStorage fallback) |
| **Collection** | `user_sessions/{uid}` — fields: `state`, `registrationStatus`, `scenario`, `intent`, `lastStep`, `timestamp` |
| **Security rules** | `client/firestore.rules` — users can only read/write their own document (`request.auth.uid == uid`) |
| **Throttle** | Max 1 Firestore write per 5 seconds per session to prevent quota exhaustion |

---

### 4. Google Analytics (GA4)
| | |
|---|---|
| **Purpose** | Tracks anonymised interaction patterns to understand how citizens use the guidance flow |
| **Implementation** | `client/src/services/analytics.js` |
| **Events tracked** | `form_submitted`, `guidance_shown`, `gemini_simplified`, `maps_link_clicked`, `maps_opened`, `directions_opened`, `session_resumed`, `chat_message_sent`, `translate_link_clicked` |
| **Privacy** | Zero PII in event parameters — no age values, no names, no IDs |

---

### 5. Google Maps
| | |
|---|---|
| **Purpose** | Helps users find their nearest polling booth, Electoral Registration Office (ERO), or government building |
| **Implementation** | `client/src/components/flow/LocationExplorer.jsx` |
| **Features** | Browser geolocation (`navigator.geolocation`) for GPS-accurate searches · `🔍 Find` button opens Maps search · `👉 Directions` button opens turn-by-turn navigation via `maps/dir/?api=1&destination=...` |
| **Geo badge** | `🎯 Using your current location` badge when GPS is granted; falls back to state-based search |

---

### 6. Google Translate (Widget)
| | |
|---|---|
| **Purpose** | Makes the app accessible to non-English-speaking Indian citizens in their native language |
| **Implementation** | `client/index.html` — Google Translate in-page widget via `translate.google.com/translate_a/element.js` |
| **Behaviour** | In-place translation of all UI text without redirecting away from the app |

---

### 7. Google Sheets (Analytics Pipeline)
| | |
|---|---|
| **Purpose** | Lightweight anonymous event logging for operational analytics |
| **Implementation** | `server/src/services/sheetsLogger.service.js` · `server/src/routes/logs.routes.js` |
| **Endpoint** | `POST /api/logs/session` — accepts `{ state, scenario, action }`, fire-and-forget |
| **Setup** | Deploy the included Apps Script (see `sheetsLogger.service.js` header) and set `SHEETS_WEBHOOK_URL` in `server/.env` |

---

### Setup: Google Services Environment Variables

```env
# server/.env
GEMINI_API_KEY=your-gemini-api-key
SHEETS_WEBHOOK_URL=your-apps-script-web-app-url   # optional

# client/.env
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```


## Setup Instructions

### Environment Variables
You must create `.env` files in both directories. (See `.env.example` in each folder).

**Server (`/server/.env`)**:
```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
GEMINI_API_KEY=your_google_gemini_api_key
```

**Client (`/client/.env`)**:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### Running Locally
**1. Start the Backend:**
```bash
cd server
npm install
npm run dev
```

**2. Start the Frontend:**
```bash
cd client
npm install
npm run dev
```

## Key Features
* **Statutory Eligibility Checks**: Hardcoded mapping of Age boundaries preventing unviable vectors securely.
* **Smart Scenario Resolution**: Detects complex scenarios (e.g., Migrated First-Time Voters vs. Correction Needed).
* **Gemini Explain Mode**: On-demand summarization of complex rules.
* **Google Maps Injection**: Generates instant physical directions based on backend logic.
* **Resume Journey**: Safe session recovery using Firestore.

## Documentation Reference
For deep technical dives into how this project aligns with evaluation criteria, please see the `/docs` folder:
* [Architecture Overview](./docs/architecture.md)
* [Security Policies](./docs/security.md)
* [API Specification](./docs/api-docs.md)
* [Evaluation Criteria Mapping](./docs/evaluation-mapping.md)
