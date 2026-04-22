/**
 * Builds a Gemini prompt for explaining polling location relevance.
 * Pure function — no side effects, no API calls.
 */
export function buildMapsExplainPrompt({ state, intent, registrationStatus, nextBestAction, age, scenario }) {
  const location =
    intent && intent.trim().length > 3 ? `${intent.trim()}, ${state}` : state || "India";

  const userProfile = [
    age ? `Age: ${age}` : null,
    state ? `State: ${state}` : null,
    registrationStatus ? `Registration status: ${registrationStatus}` : null,
    scenario ? `Scenario: ${scenario}` : null
  ]
    .filter(Boolean)
    .join(", ");

  return [
    "You are assisting a voter in India.",
    "Do not hallucinate specific polling booth names.",
    "Do not give political opinions.",
    "",
    "Context:",
    `User profile: ${userProfile}`,
    `Location: ${location}`,
    `Next Step: ${nextBestAction || "Check official portal"}`,
    "",
    "Task:",
    "Write a short, personal explanation (under 90 words) for this specific user that:",
    `1. Opens with 'Since you are ${age ? `${age} years old and ` : ""}${registrationStatus === "not_registered" ? "not yet registered" : registrationStatus === "unsure" ? "unsure of your registration status" : "registered"} in ${state || "India"},'`,
    "2. Explains WHY visiting a nearby government school or election office helps them",
    "3. States clearly what they should do NEXT",
    "",
    "Rules:",
    "- Maximum 90 words",
    "- Use simple, human language — speak directly to the user",
    "- Reference their specific state naturally",
    "- Be actionable (end with what to do)",
    "- Do not hallucinate specific polling booth names",
    "- Do not give political opinions"
  ].join("\n");
}
