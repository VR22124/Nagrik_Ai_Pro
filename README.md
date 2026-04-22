# NagrikAI Pro

## Overview
NagrikAI Pro is a modern, AI-powered election guidance system designed to help citizens smoothly navigate the complex electoral registration process. By mapping the nuanced rules of the Election Commission of India into a deterministic rules-engine and enhancing it with Google Gemini, NagrikAI Pro provides clear, actionable, and 100% accurate guidance to voters.

## Problem Statement
Millions of citizens face difficulties voting due to misinterpreting eligibility requirements, struggling with bureaucratic forms for migrating constituencies, or incorrectly assuming a lost ID card rescinds their voting rights. The process is scattered, jargon-heavy, and intimidating.

## Solution Overview
NagrikAI Pro centralizes and demystifies the voter registration process. It features:
* A strictly deterministic legal rules engine acting as the absolute source of truth.
* A step-by-step un-paginated UI that isolates the precise tasks a user must complete right now.
* A Gemini AI enhancement layer that translates complex electoral jargon into native, simple phrasing without hallucination risks.
* Secure, private computation that requires zero sensitive PII tracking. 

## Key Features
* **Statutory Eligibility Checks**: Hardcoded mapping of Age and Citizenship rules blocking unviable vectors securely.
* **Smart Scenario Resolution**: Detects complex scenarios (e.g., Migrated First-Time Voters vs. Regular Correction Voters).
* **Gemini Explain Mode**: On-demand summarization of complex rules.
* **Contextual AI Chat**: A grounded assistant answering questions mapped purely to your current registration scenario.

## Tech Stack
* **Frontend**: React, Vite, TailwindCSS (Responsive, lazy-loaded UI)
* **Backend**: Node.js, Express (Stateless, cached API)
* **AI Provider**: Google Gemini Flash (Strictly bounded context)
* **Testing**: Node Native Test Runner
* **Deployment**: Firebase Hosting (Frontend), Render (Backend)

## Architecture Overview
The system uses a separated Client-Server model. The React frontend handles local state, form input, and DOM repainting. Context payloads are dispatched to the Node/Express backend where they are processed strictly through deterministic decision tree services (`electionLogic.service`, `guidance.service`, etc.). If AI generation is required, the Express server acts as a secure intermediary agent querying Google APIs dynamically and piping safe JSON structures back to the UI.

## Setup Instructions

### Environment Variables
You must create a `.env` file in the `/server` directory:
```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,https://nagrik-ai-pro.web.app
GEMINI_API_KEY=your_google_gemini_api_key
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

## Deployment
* **Frontend**: Hosted on Google Firebase (`nagrik-ai-pro.web.app`). Protected by `.env` mapping and GitHub Actions CI pipelines.
* **Backend**: Hosted on Render (`nagrik-ai-pro.onrender.com`). Securely serves AI requests underneath Helmet security and strict CORS rules natively trusting the Firebase container.
