# Google Services Integration

NagrikAI Pro uses Google Gemini AI for the following features:

- **Explain Mode**: Simplifies election guidance using Gemini 2.5 Flash model.
- **Chat Assistant**: Provides context-aware election help via Gemini chat.
- **Maps Integration**: Uses Google Maps search URLs for polling booth lookup (no API key required on client).

**Security**:
- All Gemini API calls are proxied through the backend. The API key is never exposed to the frontend.
- No Google Analytics or advertising cookies are used.

**Consent**:
- A consent banner is shown to users before enabling Gemini-powered features.
- See privacy.html for details.

**Firebase**: (Planned) For lightweight persistence and hosting.

_Last updated: 21 April 2026_
