const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function fetchGuidance(payload) {
  const response = await fetch(`${API_BASE}/guidance/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to fetch guidance");
  }
  return response.json();
}
