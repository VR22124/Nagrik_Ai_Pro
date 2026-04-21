# Security Practices

## API Security
- All sensitive API keys (Gemini, MongoDB) are stored in `.env` and never exposed to the frontend.
- All API endpoints use validation and sanitization middleware.
- CORS is restricted to allowed origins from `.env`.
- HTTP security headers are enforced with `helmet`.
- Rate limiting is applied globally to all endpoints.

## Client Security
- No secrets or API keys are present in client code.
- All Gemini/Google API calls are proxied through the backend.

## Deployment
- `.env` and sensitive files are listed in `.gitignore` and never committed.
- Use HTTPS in production.

_Last reviewed: 21 April 2026_
