import { recommendScenario } from "../services/scenario.service.js";

export function recommendScenarioController(req, res) {
  const { registrationStatus = "unsure", intent = "", migrationType = "unspecified" } = req.body || {};
  const scenario = recommendScenario(registrationStatus, intent, { migrationType });
  res.json({ scenario });
}
