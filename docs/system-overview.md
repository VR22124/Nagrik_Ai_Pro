# System Overview

## What NagrikAI Pro Does
NagrikAI Pro is an intelligent, highly structured electoral guidance system built to help citizens smoothly navigate the Election Commission of India's (ECI) registration and voting processes. It simplifies bureaucratic hurdles into a personalized, actionable checklist, answering exactly what a user needs to do right now.

## Target Users
* **First-time voters** looking for clear instructions on Form 6.
* **Migrant workers and students** who have moved cities or states and are unsure how to transfer their voting rights.
* **Citizens with lost or damaged Voter IDs** seeking replacement procedures without losing their right to vote.
* **Users needing corrections** in their existing electoral roll data.
* **Citizens unsure of their registration status** who need immediate verification steps.

## Core Problem Being Solved
Voter intimidation through bureaucracy. The Indian electoral system is massive, and while the infrastructure exists, the documentation is dense, scattered, and intimidating. Citizens often fail to vote because they misunderstand eligibility, assume they need to travel back to their home state, or believe a lost ID means they cannot vote. NagrikAI Pro solves this by acting as a deterministic translation layer between the citizen and the legal framework.

## High-Level Architecture
NagrikAI Pro employs a decoupled, highly scalable architecture utilizing modern web standards and deep Google Cloud integrations:

* **Frontend (React + Vite + TailwindCSS)**: A lightning-fast, un-paginated single-page application hosted on Firebase Hosting. It focuses purely on capturing user context and rendering structured guidance cleanly.
* **Backend (Node.js + Express)**: A stateless API hosted on Render. It contains the deterministic Rules Engine that calculates eligibility and required actions without hallucination.
* **Firebase (Auth + Firestore)**: Handles anonymous session creation and state persistence, allowing users to safely resume their journey without submitting Personally Identifiable Information (PII).
* **Gemini AI (Google)**: Acts as an explanation layer. While the core logic is deterministic, Gemini steps in to translate complex legal outcomes into simple, native language.
* **Google Maps**: Injected into the guidance flow to provide instant, dynamic deep links to local Electoral Registration Offices (EROs) and polling booths.
* **Google Translate**: A lightweight, client-side integration allowing non-English speakers to instantly read the UI in regional languages without complex backend routing.
