import { normalizeContext } from "../services/context.service.js";
import { generateGuidance } from "../services/guidance.service.js";

export function generateGuidanceController(req, res) {
  const context = normalizeContext(req.body);
  const payload = generateGuidance(context);
  res.json(payload);
}
