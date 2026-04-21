export function getDeadlineGuidance(timelineRisk) {
  const riskLine =
    timelineRisk?.level === "high"
      ? "High urgency: delaying this step can exclude you from an upcoming election."
      : timelineRisk?.level === "medium"
        ? "Moderate urgency: complete verification early to avoid correction bottlenecks."
        : "Standard urgency: complete actions early for smoother verification.";

  return [
    riskLine,
    timelineRisk?.message || "Apply early to avoid last-minute issues.",
    "Apply early to be included in the next electoral roll update.",
    "Verify deadlines on NVSP or Voter Helpline before election notification cut-offs."
  ];
}
