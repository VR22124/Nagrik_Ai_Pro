import { Router } from "express";
import { logToSheets } from "../services/sheetsLogger.service.js";

const router = Router();

const ALLOWED_ACTIONS = new Set([
  "maps_opened",
  "directions_opened",
  "location_searched",
  "session_started"
]);

/**
 * POST /api/logs/session
 * Anonymous analytics endpoint — logs user interaction events to Google Sheets.
 * No personal data. Fire-and-forget logging.
 */
router.post("/session", async (req, res) => {
  const { state, scenario, action } = req.body || {};

  if (!state || typeof state !== "string" || !state.trim()) {
    return res.status(400).json({ error: "state is required." });
  }
  if (!scenario || typeof scenario !== "string" || !scenario.trim()) {
    return res.status(400).json({ error: "scenario is required." });
  }
  if (!action || !ALLOWED_ACTIONS.has(action)) {
    return res.status(400).json({
      error: `action must be one of: ${[...ALLOWED_ACTIONS].join(", ")}`
    });
  }

  // Fire-and-forget — do NOT await; never block the response
  logToSheets({
    state: state.trim().slice(0, 64),
    scenario: scenario.trim().slice(0, 64),
    action
  }).catch(() => {}); // Extra safety — suppress any async rejection

  return res.json({ ok: true });
});

export default router;
