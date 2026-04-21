import { Router } from "express";
import { recommendScenarioController } from "../controllers/scenarios.controller.js";
import { validateScenarioRequest } from "../middleware/validateRequest.middleware.js";

const router = Router();
router.post("/recommend", validateScenarioRequest, recommendScenarioController);

export default router;
