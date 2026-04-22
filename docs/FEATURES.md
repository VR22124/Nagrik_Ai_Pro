# Features

NagrikAI Pro implements the following core features:

## 1. Election Guidance Engine
* **What it does**: A deterministic rules engine running on the backend that evaluates age, state, and registration status against actual ECI rules.
* **Why it matters**: Guarantees 100% accurate, hallucination-free legal guidance regarding eligibility and form numbers.

## 2. Smart Scenario Detection
* **What it does**: Intelligently categorizes users into complex paths (e.g., "Migrated First-Time Voter" vs. "Correction Needed") based on dropdown selections and open-text intents.
* **Why it matters**: Users often don't know the official terminology. The system translates their real-world situation into bureaucratic action items.

## 3. Step-by-Step UI Flow
* **What it does**: Renders complex processes as bite-sized, un-paginated UI components (Next Best Action, Do This Now, Smart Warnings).
* **Why it matters**: Reduces cognitive overload and voter intimidation.

## 4. Google Maps Polling Location Discovery
* **What it does**: Dynamically generates Google Maps links pre-filled with search queries for Electoral Registration Offices (EROs) and polling booths specific to the user's state and scenario.
* **Why it matters**: Bridges the gap between digital registration and physical voting.

## 5. Gemini Smart Guidance (Explain Mode)
* **What it does**: A toggleable feature that uses Google Gemini to rewrite the rigid legal guidance into simple, conversational paragraphs.
* **Why it matters**: Makes bureaucratic language accessible to citizens of all education levels.

## 6. Google Translate Multilingual Support
* **What it does**: A client-side translation selector that seamlessly translates the entire interface into regional Indian languages via Google Translate.
* **Why it matters**: Ensures the platform is usable across India's incredibly diverse linguistic landscape without heavy backend translation infrastructure.

## 7. Firebase Auth (Anonymous Identity)
* **What it does**: Transparently creates a secure, anonymous session ID the moment a user loads the app.
* **Why it matters**: Protects user privacy (no PII required) while allowing the backend to track their session.

## 8. Firestore Session Persistence
* **What it does**: Saves the user's form inputs and current state to a secure cloud database.
* **Why it matters**: Prevents users from losing their progress if they close the tab while looking for their Aadhar card.

## 9. Resume Journey
* **What it does**: Detects previous incomplete sessions upon page load and prompts the user to restore their data.
* **Why it matters**: Vastly improves the completion rate of bureaucratic tasks by accommodating real-life interruptions.

## 10. Analytics Tracking
* **What it does**: Utilizes GA4 to track anonymized engagement metrics (e.g., scenarios encountered, forms generated).
* **Why it matters**: Provides system administrators with critical insights into which voter registration flows are causing the most confusion nationally.
