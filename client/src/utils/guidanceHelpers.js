/**
 * Compact text to a maximum number of words, appending "..." when truncated.
 *
 * @param {string} text - Input text to compact.
 * @param {number} [maxWords=95] - Maximum allowed word count before truncation.
 * @returns {string} Compacted text.
 *
 * @example
 * compactWords("one two three four five", 3); // "one two three..."
 */
export function compactWords(text, maxWords = 95) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!words.length) return "";
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

/**
 * Shorten a single guidance line to a maximum character count.
 * Strips leading bullet/numbering characters before truncating.
 *
 * @param {string} text - Raw guidance line.
 * @param {number} [maxChars=130] - Maximum characters before truncation.
 * @returns {string} Cleaned and shortened line.
 *
 * @example
 * shortenLine("• Fill out Form 6 on the NVSP portal.", 30); // "Fill out Form 6 on the NVSP..."
 */
export function shortenLine(text, maxChars = 130) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/^[-•\d.\s]+/, "")
    .trim();
  if (!cleaned) return "";
  if (cleaned.length <= maxChars) return cleaned;
  return `${cleaned.slice(0, maxChars - 1).trim()}...`;
}

/**
 * Deduplicate an array of guidance lines and limit to a maximum count.
 * Deduplication is case-insensitive.
 *
 * @param {string[]} [items=[]] - Raw array of guidance strings.
 * @param {number} [maxItems=4] - Maximum number of unique items to return.
 * @returns {string[]} Deduplicated, shortened items.
 *
 * @example
 * dedupeAndLimit(["Check status", "Check status", "Submit form"], 2);
 * // ["Check status", "Submit form"]
 */
export function dedupeAndLimit(items = [], maxItems = 4) {
  const seen = new Set();
  const result = [];

  for (const raw of items) {
    const line = shortenLine(raw);
    if (!line) continue;
    const key = line.toLowerCase();

    // Skip if we've already tracked this exact line (case-insensitive)
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(line);
    if (result.length >= maxItems) break;
  }
  return result;
}

/**
 * Produce a human-readable summary line based on the user's registration status.
 * Falls back to the first userStatus line from the guidance object.
 *
 * @param {object|null} guidance - Backend guidance response.
 * @param {object} form - Current form state.
 * @param {string} form.registrationStatus - "registered" | "not_registered" | "unsure"
 * @returns {string} Summary sentence for the SummaryHeader component.
 */
export function getSummaryLine(guidance, form) {
  if (!guidance) return "";

  // Directly handle known registration states for UX clarity
  if (form.registrationStatus === "not_registered") {
    return "You are eligible but not registered. You need to register to vote.";
  }
  if (form.registrationStatus === "registered") {
    return "You are registered. Verify your details and polling booth before voting day.";
  }
  if (form.registrationStatus === "unsure") {
    return "Your registration status is unclear. First check your name in the voter list.";
  }

  // Fallback to primary guidance line
  return guidance.userStatus?.[0] || "Election guidance summary.";
}

/**
 * Extract the single most important next action from guidance.
 *
 * @param {object|null} guidance - Backend guidance response.
 * @returns {string} The primary next action, or a safe fallback string.
 */
export function getNextBestAction(guidance) {
  return guidance?.requiredActions?.[0] || "Start registration on the official portal.";
}

/**
 * Resolve the scenario label from the guidance response.
 * Falls back to the form's scenario value if the backend did not echo one.
 *
 * @param {object} guidance - Backend guidance response.
 * @param {string} fallbackScenario - The scenario value from the form.
 * @returns {string} Resolved scenario string.
 */
export function getResolvedScenario(guidance, fallbackScenario) {
  // Try to parse the backend resolved scenario label, if available
  const resolved = (guidance?.userStatus || []).find((line) =>
    line.toLowerCase().startsWith("resolved scenario:")
  );
  if (!resolved) return fallbackScenario || "unknown";
  return resolved.split(":").slice(1).join(":").trim() || fallbackScenario || "unknown";
}

/**
 * Map a next-best-action string to a CTA button label and time estimate.
 * Used to generate contextual guidance card metadata.
 *
 * @param {string} nextAction - The primary next action string.
 * @returns {{ ctaLabel: string, timeEstimate: string }}
 */
export function getCtaMeta(nextAction) {
  const text = String(nextAction || "").toLowerCase();

  // Categorize action dynamically to provide accurate metadata
  if (text.includes("form 6")) {
    return { ctaLabel: "Start Registration (Form 6)", timeEstimate: "5–10 min" };
  }
  if (text.includes("form 8")) {
    return { ctaLabel: "Update Details (Form 8)", timeEstimate: "5–10 min" };
  }
  if (text.includes("booth")) {
    return { ctaLabel: "Check Polling Booth", timeEstimate: "2–5 min" };
  }
  if (text.includes("electoral roll") || text.includes("check your name")) {
    return { ctaLabel: "Check Voter Status", timeEstimate: "2–5 min" };
  }
  return { ctaLabel: "Continue This Step", timeEstimate: "5–8 min" };
}

/**
 * Organise guidance fields into three display sections:
 * "What You Should Do", "Be Careful", and "Why This Matters".
 *
 * @param {object|null} guidance - Backend guidance response.
 * @returns {[string[], string[], string[]]} Tuple of [whatToDo, beCareful, whyItMatters].
 */
export function getGuidedSections(guidance) {
  if (!guidance) return [[], [], []];

  const whatYouShouldDo = dedupeAndLimit([
    ...(guidance.requiredActions || []).filter((line) => {
      const l = line.toLowerCase();
      // Only keep direct instructions, excluding rules or why reasons
      return !l.startsWith("rule:") && !l.startsWith("why:") && !l.startsWith("risk:");
    }),
    ...(guidance.nextSteps || [])
  ]);

  const beCareful = dedupeAndLimit([
    ...(guidance.importantDeadlines || []),
    ...(guidance.commonMistakes || []),
    ...(guidance.documentsNeeded || []).filter((line) => {
      const l = line.toLowerCase();
      return l.includes("missing") || l.includes("delay") || l.includes("proof") || l.includes("risk");
    })
  ]);

  const whyThisMatters = dedupeAndLimit([
    ...(guidance.requiredActions || [])
      .filter((line) => line.toLowerCase().startsWith("why:"))
      .map((line) => line.replace(/^why:\s*/i, "")),
    guidance.keyInsight,
    guidance.practicalTip
  ]);

  return [whatYouShouldDo, beCareful, whyThisMatters];
}

/**
 * Return the standard set of action buttons for the guidance result.
 * These are constant official ECI portal links.
 *
 * @param {object|null} guidance - Backend guidance response (currently unused but kept for API stability).
 * @returns {Array<{ label: string, url: string, helper: string }>}
 */
export function getActionButtons(guidance) {
  if (!guidance) return [];
  return [
    {
      label: "Go to Registration",
      url: "https://voters.eci.gov.in/",
      helper: "NVSP Official Portal"
    },
    {
      label: "Check Status",
      url: "https://electoralsearch.eci.gov.in/",
      helper: "Search your name in the roll"
    }
  ];
}

/**
 * Extract and deduplicate the top 3 actionable steps from guidance.
 * Filters out internal rule/why annotations before returning.
 *
 * @param {object|null} guidance - Backend guidance response.
 * @returns {string[]} Up to 3 shortened actionable step strings.
 */
export function getDoThisNowSteps(guidance) {
  if (!guidance) return [];
  const steps = dedupeAndLimit(
    (guidance.requiredActions || []).filter(
      (line) => !line.toLowerCase().startsWith("rule:") && !line.toLowerCase().startsWith("why:")
    ),
    3
  );
  return steps.map((s) => shortenLine(s, 110));
}

/**
 * Extract smart warnings from guidance — deadline and risk-tagged items only.
 *
 * @param {object|null} guidance - Backend guidance response.
 * @returns {string[]} Up to 2 high-priority warning strings.
 */
export function getSmartWarnings(guidance) {
  if (!guidance) return [];
  return dedupeAndLimit(
    [...(guidance.importantDeadlines || []), ...(guidance.documentsNeeded || [])].filter((w) =>
      w.toLowerCase().includes("risk") || w.toLowerCase().includes("deadline")
    ),
    2
  );
}
