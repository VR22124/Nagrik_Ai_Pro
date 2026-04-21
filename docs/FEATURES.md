# Core Features

## 1. Deterministic Guided Flow
The core of NagrikAI Pro is its logic engine. Users input their current age, location, and voting background into a centralized form. Instead of receiving a dense FAQ document, the system calculates the exact sequence of events required (e.g., "Submit Form 6," "Provide Hostel utility bill," etc.) based purely on their specific combination of inputs.

## 2. Action-Driven Interface
The UI has been engineered to eliminate cognitive overload:
* **Next Best Action Priority**: Steps are displayed sequentially. 
* **Do This Now**: A strict list of immediate physical tasks is rendered for the user.
* **Smart Warnings**: Predicts potential form rejection vectors (like "Address mismatch") and warns the user before they submit official documentation.

## 3. Strict Eligibility Blockades
Users who attempt to navigate the system while underage are blocked instantly. The UI aggressively substitutes complex guidance forms for a single, unmistakable `Not Eligible Yet` banner to ensure zero confusion regarding the Indian Constitution's 18+ requirement.

## 4. Explain Mode (Gemini)
Legal syntax is complex ("Verify constituency assignment prior to..." ). Users can toggle an AI-powered "Explain Mode" that queries Google Gemini to dynamically rewrite the deterministic backend guidance into extremely simple, accessible English.

## 5. Context-Bound Chat Assistant
Instead of a separate generic chatbot, the UI features a persistent ChatBox mapped directly to the user's evaluated state. If you ask the ChatBox "What do I do?", the AI already knows your exact age, registration status, and scenario via the Express proxy server, ensuring heavily contextualized advice.
