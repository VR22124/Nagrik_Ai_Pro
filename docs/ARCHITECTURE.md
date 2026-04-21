# System Architecture

## Text Architecture Diagram
```text
[ Citizen (Browser) ] 
       | (React, Suspense, Tailwind)
       v
[ Client Application (Firebase Hosted) ] 
       | (Fetch API via CORS Whitelist)
       v
[ Render Express Backend ]
       |---> [ Security Middlewares: Helmet, RateLimit, Validator ]
       v
[ Routing Layer (Express Router) ]
       |
       |--> /api/guidance 
       |      |---> [ Guidance Service ] -> [ Election Logic & Scenarios ]
       |
       |--> /api/gemini 
              |---> [ Gemini Service ] -----> [ Google APIs Network ]
```

## Separation of Concerns
1. **Client (UI Layer)**: Strictly responsible for DOM rendering, accessibility handling (`aria-live`), and localized component chunking (`React.lazy()`). It holds zero business logic.
2. **API (Routing Layer)**: Receives external JSON, authenticates structure via Joi, strips XSS payloads, and blocks excessive IP queries.
3. **Services (Business Logic)**: Defines explicit statutory rules (e.g., `electionLogic.service.js`). Calculates form assignment matching.
4. **Data (Config Layer)**: Hardcoded statutory strings and rulesets ensuring standard, verifiable outputs free of variation.
