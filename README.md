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

## Deep Google Ecosystem Integration
1. **Google Gemini Flash**: Translates dense legal rules into simple language and answers contextual chat queries.
2. **Firebase Auth (Anonymous)**: Generates secure session identities without forcing email signups.
3. **Google Firestore**: Persists user journeys, allowing them to resume exactly where they left off.
4. **Google Maps**: Dynamically routes users to their local Electoral Registration Offices (EROs).
5. **Google Translate**: Translates the entire platform into regional Indian languages instantly.
6. **Google Analytics 4**: Tracks anonymized scenarios to help administrators improve voting flows.

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
