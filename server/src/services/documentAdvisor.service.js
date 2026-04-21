export function suggestDocuments({ scenario, state, hasAddressProof }) {
  const common = ["Photo identity proof", "Address proof", "Recent passport photo"];
  if (scenario === "first_time" || scenario === "first_time_migrated" || scenario === "eligible_unregistered") {
    const docs = [
      ...common,
      "Age proof (birth certificate, marksheet, or passport)",
      `Current address proof in ${state}`
    ];
    if (scenario === "first_time_migrated" && !hasAddressProof) {
      docs.push("Hostel letter or employer accommodation letter as interim support");
    }
    return docs;
  }
  if (scenario.includes("migrated")) {
    const migrantDocs = ["New address proof (rental agreement, utility bill, or bank passbook)"];
    if (!hasAddressProof) {
      migrantDocs.push("Hostel letter or employer accommodation letter as interim support");
    }
    return [...common, ...migrantDocs];
  }
  if (scenario === "lost_id" || scenario === "lost_id_registered") {
    return ["Identity proof and registered mobile number for account recovery"];
  }
  return common;
}
