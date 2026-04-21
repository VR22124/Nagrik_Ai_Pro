function simplifyLine(line) {
  return line
    .replaceAll("electoral roll", "voter list")
    .replaceAll("constituency", "area")
    .replaceAll("verification", "checking")
    .replaceAll("acknowledgment", "tracking number")
    .replaceAll("registration", "sign-up");
}

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
