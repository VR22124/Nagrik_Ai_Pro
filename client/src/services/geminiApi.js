import { API_BASE_URL } from "../utils/constants";

async function postGemini(path, payload) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (import.meta.env.DEV) {
        console.error(`[geminiApi] ${path} failed:`, errorData?.error || res.status);
      }
      return null;
    }

    const data = await res.json();
    const text = typeof data?.text === "string" ? data.text.trim() : "";
    return text || null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[geminiApi] ${path} request error:`, error);
    }
    return null;
  }
}

export async function generateSimpleExplanation(response, userContext = {}) {
  return postGemini("/gemini/explain", { response, userContext });
}

export async function geminiChat(message, options = {}) {
  const { userContext = {}, guidance = {} } = options;
  return postGemini("/gemini/chat", { message, userContext, guidance });
}

export async function geminiMapsExplain({ state, intent, registrationStatus, nextBestAction, age, scenario }) {
  return postGemini("/gemini/maps-explain", { state, intent, registrationStatus, nextBestAction, age, scenario });
}
