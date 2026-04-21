import { checkEligibility } from "../services/electionLogic.service.js";

export function checkEligibilityController(req, res) {
  const age = Number(req.body?.age);
  const result = checkEligibility(age);
  res.json(result);
}
