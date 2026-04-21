import { COMPLIANCE_NOTICE } from "../services/compliance.service.js";

export function complianceGuard(_req, res, next) {
  res.locals.complianceNotice = COMPLIANCE_NOTICE;
  next();
}
