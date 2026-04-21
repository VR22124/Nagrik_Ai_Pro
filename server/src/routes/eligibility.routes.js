import { Router } from "express";
import { checkEligibilityController } from "../controllers/eligibility.controller.js";
import { validateEligibilityRequest } from "../middleware/validateRequest.middleware.js";

const router = Router();
router.post("/check", validateEligibilityRequest, checkEligibilityController);

export default router;
