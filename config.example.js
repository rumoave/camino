// Copy this file to `config.local.js` and fill in your Anthropic API key.
// `config.local.js` is gitignored — your key never gets committed.
//
//   cp config.example.js config.local.js
//
// Get a key at https://console.anthropic.com (API Keys section).
// Each Cami message costs ~$0.005 with Haiku — start with $5 in credit.

// The ElevenLabs key is only read by scripts/generate-tts.js (build-time voice
// clip generation) — it is never shipped to or used by the app at runtime.
// Get one at https://elevenlabs.io → Profile → API Keys.

window.CAMINO_CONFIG = {
  anthropicApiKey: null, // 'sk-ant-...'
  elevenLabsApiKey: null, // 'sk_...' — for `node scripts/generate-tts.js`
  // Override the model if you want quality over cost:
  //   'claude-haiku-4-5-20251001' (default, fastest, cheapest)
  //   'claude-sonnet-4-6'         (better quality, ~3x cost)
  //   'claude-opus-4-8'           (best quality, ~15x cost)
  model: null
};
