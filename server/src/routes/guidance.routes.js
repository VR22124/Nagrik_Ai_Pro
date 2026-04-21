import { Router } from "express";
import { generateGuidanceController } from "../controllers/guidance.controller.js";
import { validateGuidanceRequest } from "../middleware/validateRequest.middleware.js";
import { complianceGuard } from "../middleware/complianceGuard.middleware.js";

const router = Router();

router.post("/generate", validateGuidanceRequest, complianceGuard, generateGuidanceController);

export default router;
