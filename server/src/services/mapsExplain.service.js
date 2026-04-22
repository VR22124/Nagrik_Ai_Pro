/**
 * Builds a Gemini prompt for explaining polling location relevance.
 * Pure function — no side effects, no API calls.
 */
export function buildMapsExplainPrompt({ state, intent, registrationStatus, nextBestAction }) {
  const location =
    intent && intent.trim().length > 3 ? `${intent.trim()}, ${state}` : state || "India";

  return [
    "You are assisting a voter in India.",
    "Do not hallucinate specific polling booth names.",
    "Do not give political opinions.",
    "",
    "Context:",
    `State: ${state || "unknown"}`,
    `Location: ${location}`,
    `Registration Status: ${registrationStatus || "unknown"}`,
    `Next Step: ${nextBestAction || "Check official portal"}`,
    "",
    "Task:",
    "Explain in simple, practical terms:",
    "1. Why polling locations are usually schools or public buildings",
    "2. What the user should look for nearby",
    "3. What they should do NEXT based on their situation",
    "",
    "Rules:",
    "- Keep response under 80-100 words",
    "- Use simple, human language",
    "- Reference the user's location naturally",
    "- Be actionable (tell what to do)",
    "- Do not hallucinate specific polling booth names",
    "- Do not give political opinions"
  ].join("\n");
}
