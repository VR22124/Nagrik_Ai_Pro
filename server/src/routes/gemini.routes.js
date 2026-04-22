import "dotenv/config";
import { Router } from "express";
import {
  validateGeminiChatRequest,
  validateGeminiExplainRequest,
  validateGeminiMapsExplainRequest
} from "../middleware/validateRequest.middleware.js";
import { buildMapsExplainPrompt } from "../services/mapsExplain.service.js";

const router = Router();

const BASE_POLICY = [
  "You are helping a user in an Indian election guidance system.",
  "Follow Election Commission of India process language.",
  "Provide only factual information.",
  "Do not give political opinions, endorsements, or party comparisons.",
  "Do not hallucinate or add facts beyond the provided context.",
  "Backend guidance is the source of truth."
].join("\n");

function extractGeminiText(payload) {
  return payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

function clampByWords(text, maxWords = 120) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function clampByLines(text, maxLines = 8) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxLines)
    .join("\n");
}

function normalizeText(text, maxWords = 120, maxLines = 8) {
  return clampByWords(clampByLines(text, maxLines), maxWords);
}

function toSafeContext(userContext = {}, guidance = {}) {
  return {
    age: userContext.age ?? "unknown",
    state: userContext.state ?? "unknown",
    registrationStatus: userContext.registrationStatus ?? "unknown",
    scenario: userContext.scenario ?? "unknown",
    nextBestAction: userContext.nextBestAction || guidance?.requiredActions?.[0] || "unknown"
  };
}

function toGuidanceSnapshot(guidance = {}) {
  return {
    userStatus: guidance?.userStatus || [],
    requiredActions: guidance?.requiredActions || [],
    documentsNeeded: guidance?.documentsNeeded || [],
    importantDeadlines: guidance?.importantDeadlines || [],
    keyInsight: guidance?.keyInsight || "",
    practicalTip: guidance?.practicalTip || ""
  };
}

function buildContextBlock(userContext, guidance) {
  const ctx = toSafeContext(userContext, guidance);
  return [
    "User context:",
    `- Age: ${ctx.age}`,
    `- State: ${ctx.state}`,
    `- Registration status: ${ctx.registrationStatus}`,
    `- Scenario: ${ctx.scenario}`,
    `- Next best action: ${ctx.nextBestAction}`
  ].join("\n");
}

function buildExplainPrompt(guidance, userContext) {
  return [
    BASE_POLICY,
    "",
    buildContextBlock(userContext, guidance),
    "",
    "Task:",
    "Rewrite the following guidance in simple, clear language for this specific user.",
    "",
    "Output rules:",
    "- Maximum 120 words.",
    "- Keep the original meaning unchanged.",
    "- Do not add new facts.",
    "- Keep it practical and easy to understand.",
    "",
    "Structured backend guidance:",
    JSON.stringify(toGuidanceSnapshot(guidance), null, 2)
  ].join("\n");
}

function buildChatPrompt(message, userContext, guidance) {
  return [
    BASE_POLICY,
    "",
    buildContextBlock(userContext, guidance),
    "",
    "Grounding guidance snapshot:",
    JSON.stringify(toGuidanceSnapshot(guidance), null, 2),
    "",
    "Task:",
    "Answer the user's question with context-aware election process help.",
    "",
    "Output rules:",
    "- Maximum 120 words.",
    "- Use simple language.",
    "- Stay grounded in voter registration, voter ID issues, and election process.",
    "- Do not add facts not present in context or official process rules.",
    "",
    `User question: ${message}`
  ].join("\n");
}

/* ---------- Gemini caller with timeout + retry ---------- */

async function callGemini(prompt, contextTag, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(`[gemini:${contextTag}] Missing GEMINI_API_KEY`);
    return null;
  }

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const maxAttempts = 3;
  const { maxWords = 120, maxLines = 8, timeoutMs = 0 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let abortTimer;
    try {
      const fetchInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      };

      if (timeoutMs > 0) {
        const controller = new AbortController();
        fetchInit.signal = controller.signal;
        abortTimer = setTimeout(() => controller.abort(), timeoutMs);
      }

      const response = await fetch(GEMINI_URL, fetchInit);
      if (abortTimer) clearTimeout(abortTimer);

      const data = await response.json();

      if (!response.ok) {
        console.error(`[gemini:${contextTag}] Gemini HTTP ${response.status}`);
        if ((response.status === 429 || response.status === 503) && attempt < maxAttempts) {
          const waitMs = 250 * attempt;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }
        return null;
      }

      const text = extractGeminiText(data);
      if (!text) {
        console.error(`[gemini:${contextTag}] Empty text in Gemini response`);
        return null;
      }

      return normalizeText(text, maxWords, maxLines);
    } catch (error) {
      if (abortTimer) clearTimeout(abortTimer);
      console.error(`[gemini:${contextTag}] Request failed:`, error);
      if (attempt < maxAttempts) {
        const waitMs = 250 * attempt;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      return null;
    }
  }

  return null;
}

/* ---------- AI endpoint rate limiter (5 req/IP/min) ---------- */

const aiRateLimitMap = new Map();

function llmRateLimiter(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || "anonymous";
  const now = Date.now();
  if (!aiRateLimitMap.has(ip)) aiRateLimitMap.set(ip, []);

  const recentHits = aiRateLimitMap.get(ip).filter((ts) => now - ts < 60000);
  if (recentHits.length >= 5) {
    return res
      .status(429)
      .json({ error: "Rate limit exceeded. Please wait a minute before requesting more AI actions." });
  }

  recentHits.push(now);
  aiRateLimitMap.set(ip, recentHits);

  if (aiRateLimitMap.size > 1000) aiRateLimitMap.clear();
  next();
}

/* ---------- TTL cache for maps-explain responses ---------- */

const mapsCache = new Map();
const MAPS_CACHE_TTL = 5 * 60 * 1000;

function getMapsCache(key) {
  const entry = mapsCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.exp) {
    mapsCache.delete(key);
    return undefined;
  }
  return entry.val;
}

function setMapsCache(key, val) {
  if (mapsCache.size > 200) {
    const oldest = mapsCache.keys().next().value;
    mapsCache.delete(oldest);
  }
  mapsCache.set(key, { val, exp: Date.now() + MAPS_CACHE_TTL });
}

/* ---------- Routes ---------- */

router.post("/explain", llmRateLimiter, validateGeminiExplainRequest, async (req, res) => {
  try {
    const { response: guidance, userContext = {} } = req.body || {};
    if (!guidance || typeof guidance !== "object") {
      return res.status(400).json({ error: "response object is required." });
    }

    const prompt = buildExplainPrompt(guidance, userContext);
    const text = await callGemini(prompt, "explain", { maxWords: 120, maxLines: 8 });
    return res.json({ text });
  } catch (error) {
    console.error("[gemini:explain] Route error:", error);
    return res.status(500).json({ error: "Gemini explanation failed." });
  }
});

router.post("/chat", llmRateLimiter, validateGeminiChatRequest, async (req, res) => {
  try {
    const { message, userContext = {}, guidance = {} } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required." });
    }

    const prompt = buildChatPrompt(message.trim(), userContext, guidance);
    const text = await callGemini(prompt, "chat", { maxWords: 120, maxLines: 8 });
    return res.json({ text });
  } catch (error) {
    console.error("[gemini:chat] Route error:", error);
    return res.status(500).json({ error: "Gemini chat failed." });
  }
});

router.post("/maps-explain", llmRateLimiter, validateGeminiMapsExplainRequest, async (req, res) => {
  try {
    const { state, intent, registrationStatus, nextBestAction, age, scenario } = req.body || {};

    const cacheKey = `${state || ""}|${intent || ""}|${registrationStatus || ""}|${age || ""}|${scenario || ""}`;
    const cached = getMapsCache(cacheKey);
    if (cached !== undefined) {
      return res.json({ text: cached });
    }

    const prompt = buildMapsExplainPrompt({ state, intent, registrationStatus, nextBestAction, age, scenario });
    const text = await callGemini(prompt, "maps-explain", {
      maxWords: 100,
      maxLines: 6,
      timeoutMs: 3000
    });

    setMapsCache(cacheKey, text);
    return res.json({ text });
  } catch (error) {
    console.error("[gemini:maps-explain] Route error:", error);
    return res.json({ text: null });
  }
});

export default router;
