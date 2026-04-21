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

export function shortenLine(text, maxChars = 130) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/^[-•\d.\s]+/, "")
    .trim();
  if (!cleaned) return "";
  if (cleaned.length <= maxChars) return cleaned;
  return `${cleaned.slice(0, maxChars - 1).trim()}...`;
}

export function dedupeAndLimit(items = [], maxItems = 4) {
  const seen = new Set();
  const result = [];

  for (const raw of items) {
    const line = shortenLine(raw);
    if (!line) continue;
    const key = line.toLowerCase();
    
    // Skip if we've already tracked this exact line
    if (seen.has(key)) continue;
    
    seen.add(key);
    result.push(line);
    if (result.length >= maxItems) break;
  }
  return result;
}

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

export function getNextBestAction(guidance) {
  return guidance?.requiredActions?.[0] || "Start registration on the official portal.";
}

export function getResolvedScenario(guidance, fallbackScenario) {
  // Try to parse the backend resolved scenario label, if available
  const resolved = (guidance?.userStatus || []).find((line) =>
    line.toLowerCase().startsWith("resolved scenario:")
  );
  if (!resolved) return fallbackScenario || "unknown";
  return resolved.split(":").slice(1).join(":").trim() || fallbackScenario || "unknown";
}

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

export function getSmartWarnings(guidance) {
  if (!guidance) return [];
  return dedupeAndLimit(
    [...(guidance.importantDeadlines || []), ...(guidance.documentsNeeded || [])].filter((w) =>
      w.toLowerCase().includes("risk") || w.toLowerCase().includes("deadline")
    ),
    2
  );
}
