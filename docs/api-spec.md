# NagrikAI Pro API

## POST `/api/guidance/generate`
- Input: `age`, `state`, `registrationStatus`, `scenario`, `language`, `simpleMode`
- Output: structured guidance cards, compliance notice, official links

## POST `/api/eligibility/check`
- Input: `age`
- Output: eligibility boolean and reason

## POST `/api/scenarios/recommend`
- Input: `registrationStatus`, `intent`
- Output: normalized scenario key

## GET `/api/health`
- Output: `status: ok`
