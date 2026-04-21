const ACTION_OPENERS = [
  "Start with the official portal flow.",
  "Begin from the ECI-approved online flow.",
  "Use the official NVSP/Voter Helpline process first."
];

export function pickDeterministicPhrase(key, options) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash + key.charCodeAt(i) * (i + 1)) % 997;
  return options[hash % options.length];
}

export function getActionOpener(contextKey) {
  return pickDeterministicPhrase(contextKey, ACTION_OPENERS);
}
