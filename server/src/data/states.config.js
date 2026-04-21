export const SUPPORTED_STATES = [
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Andhra Pradesh",
  "Telangana",
  "Kerala",
  "Delhi",
  "Uttar Pradesh",
  "Gujarat",
  "West Bengal"
];

export const STATE_NUANCES = {
  "Tamil Nadu": {
    name: "Tamil Nadu",
    regionalSupport: "Tamil + English support is commonly preferred for first-time users."
  },
  Karnataka: {
    name: "Karnataka",
    regionalSupport: "Kannada + English support helps with polling day readiness."
  },
  Maharashtra: {
    name: "Maharashtra",
    regionalSupport: "Marathi + English support improves form clarity."
  }
};

export function getStateNuance(state) {
  return (
    STATE_NUANCES[state] || {
      name: state,
      regionalSupport: `Use the regional language support option for ${state} if needed.`
    }
  );
}
// Simple in-memory cache for states config
let _cachedStates = null;
let _lastLoad = 0;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export function getStatesConfig() {
  const now = Date.now();
  if (_cachedStates && now - _lastLoad < CACHE_TTL) return _cachedStates;
  // ...existing code to load states...
  // Example: _cachedStates = [ ... ];
  // _lastLoad = now;
  // return _cachedStates;
  // For now, just return the static export if present
  return states;
}

export function getAreaTypeNuance(voterAreaType) {
  if (voterAreaType === "rural") {
    return "Rural guidance: keep local landmark and village-level polling details ready for easy booth navigation.";
  }
  if (voterAreaType === "urban") {
    return "Urban guidance: recheck booth mapping close to polling day as city booth assignments can update.";
  }
  return "General guidance: verify booth location from official portal before polling day.";
}
