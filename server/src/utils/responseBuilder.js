export function buildStructuredResponse(sections) {
  return {
    userStatus: sections.userStatus || [],
    requiredActions: sections.requiredActions || [],
    documentsNeeded: sections.documentsNeeded || [],
    importantDeadlines: sections.importantDeadlines || [],
    nextSteps: sections.nextSteps || [],
    optionalHelpOptions: sections.optionalHelpOptions || [],
    journeyTimeline: sections.journeyTimeline || [],
    commonMistakes: sections.commonMistakes || [],
    smartPrompts: sections.smartPrompts || [],
    keyInsight: sections.keyInsight || "",
    practicalTip: sections.practicalTip || "",
    officialLinks: {
      nvsp: "https://voters.eci.gov.in/",
      voterHelpline: "https://eci.gov.in/voter/voter-helpline-app/"
    }
  };
}
