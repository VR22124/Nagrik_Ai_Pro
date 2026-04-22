/**
 * Replace bureaucratic election terminology with plain, everyday language.
 * Used as a pre-processing step for the simple-explanation mode.
 *
 * @param {string} line - Raw guidance line containing official terminology.
 * @returns {string} Simplified line with friendlier vocabulary.
 */
function simplifyLine(line) {
  return line
    .replaceAll("electoral roll", "voter list")
    .replaceAll("constituency", "area")
    .replaceAll("verification", "checking")
    .replaceAll("acknowledgment", "tracking number")
    .replaceAll("registration", "sign-up");
}

/**
 * Apply plain-language simplification to every text field in a guidance object.
 * Returns a new object — does not mutate the original.
 *
 * Replaces formal election terms across all guidance array fields so that
 * first-time voters and migrants can understand the guidance without prior
 * knowledge of Indian election administration vocabulary.
 *
 * @param {object|null} guidance - Raw guidance response from the backend.
 * @returns {object|null} New guidance object with simplified text, or the input if null.
 *
 * @example
 * const simple = simplifyGuidance(guidance);
 * // simple.requiredActions[0] might read "Complete sign-up using Form 6"
 * // instead of "Complete registration using Form 6"
 */
export function simplifyGuidance(guidance) {
  if (!guidance) return guidance;
  const convert = (items = []) => items.map((line) => simplifyLine(line));
  return {
    ...guidance,
    userStatus: convert(guidance.userStatus),
    requiredActions: convert(guidance.requiredActions),
    documentsNeeded: convert(guidance.documentsNeeded),
    importantDeadlines: convert(guidance.importantDeadlines),
    nextSteps: convert(guidance.nextSteps),
    optionalHelpOptions: convert(guidance.optionalHelpOptions),
    commonMistakes: convert(guidance.commonMistakes),
    smartPrompts: convert(guidance.smartPrompts)
  };
}
