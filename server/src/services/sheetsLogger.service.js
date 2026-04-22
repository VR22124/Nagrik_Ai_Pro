/**
 * sheetsLogger.service.js
 *
 * Fire-and-forget logger to Google Sheets via an Apps Script webhook.
 * Reads SHEETS_WEBHOOK_URL from env. If not set, silently no-ops.
 * Never throws — never blocks the request lifecycle.
 *
 * Setup (60 seconds):
 *  1. Go to https://script.google.com → New Project
 *  2. Paste the Apps Script code below into the editor
 *  3. Deploy → New Deployment → Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. Copy the Web App URL → set as SHEETS_WEBHOOK_URL in your .env
 *
 * Apps Script to paste:
 * ──────────────────────────────────────────────────────
 *  function doPost(e) {
 *    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *    try {
 *      const data = JSON.parse(e.postData.contents);
 *      sheet.appendRow([
 *        data.timestamp || new Date().toISOString(),
 *        data.state     || "",
 *        data.scenario  || "",
 *        data.action    || ""
 *      ]);
 *    } catch (_) {}
 *    return ContentService
 *      .createTextOutput(JSON.stringify({ ok: true }))
 *      .setMimeType(ContentService.MimeType.JSON);
 *  }
 * ──────────────────────────────────────────────────────
 */

const WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL || "";

/**
 * Log an anonymous session event to Google Sheets.
 * Fire-and-forget — callers should NOT await this unless explicitly needed.
 *
 * @param {{ state: string, scenario: string, action: string }} payload
 */
export async function logToSheets({ state, scenario, action }) {
  if (!WEBHOOK_URL) return; // Graceful no-op if not configured

  const body = {
    state: String(state || "").slice(0, 64),
    scenario: String(scenario || "").slice(0, 64),
    action: String(action || "").slice(0, 64),
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000)
    });
    console.info("[sheetsLogger] ✅ Logged to Sheets:", JSON.stringify(body));
  } catch (err) {
    // Data is still captured in server logs for audit purposes
    console.info("[sheetsLogger] 📊 Analytics event (Sheets offline):", JSON.stringify(body));
  }
}
