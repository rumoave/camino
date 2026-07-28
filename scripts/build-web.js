// Copies the plain web app into www/ — the folder Capacitor bundles into the iOS app.
// Also bundles the Capacitor plugin shim (revenuecat-shim.js → www/revenuecat.js) so
// the ordering can never be gotten wrong: without that file, window.Purchases is
// missing and Store silently degrades to the web mock (purchases broken in the store
// build). Excludes dev-only + native-incompatible files:
//   - config.local.js  (dev Anthropic key; Cami is disabled in v1)
//   - sw.js            (service worker; the app unregisters SWs and it isn't needed natively)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'www');
const FILES = ['index.html', 'app.js', 'styles.css', 'manifest.json',
               'pdflib.js', 'n400-official.pdf'];   // N-400 organizer: vendored pdf-lib + official form (edition 01/20/25)

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let ok = 0;
for (const f of FILES) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(OUT, f)); ok++; console.log('  copied', f); }
  else { console.error('  MISSING required file:', f); process.exit(1); }
}

// Pre-generated voice clips (scripts/generate-tts.js). Optional — the app falls
// back to device speechSynthesis without them — but warn so a store build
// doesn't silently ship with the robotic voice.
const AUDIO_SRC = path.join(ROOT, 'audio');
if (fs.existsSync(path.join(AUDIO_SRC, 'tts', 'manifest.json'))) {
  fs.cpSync(AUDIO_SRC, path.join(OUT, 'audio'), { recursive: true });
  const n = fs.readdirSync(path.join(AUDIO_SRC, 'tts')).filter(f => f.endsWith('.mp3')).length;
  console.log(`  copied audio/ (${n} voice clips)`);
} else {
  console.warn('  WARNING: no audio/tts/manifest.json — run `node scripts/generate-tts.js` for the upgraded voice. Shipping with speechSynthesis fallback only.');
}

// Bundle the plugin shim. Fail LOUDLY if it can't be produced — a www/ without
// revenuecat.js must never reach `cap sync`.
try {
  execSync('npx esbuild revenuecat-shim.js --bundle --format=iife --outfile=www/revenuecat.js', {
    cwd: ROOT, stdio: 'inherit'
  });
} catch (e) {
  console.error('FATAL: could not bundle revenuecat-shim.js — run `npm install` first.');
  process.exit(1);
}
if (!fs.existsSync(path.join(OUT, 'revenuecat.js'))) {
  console.error('FATAL: www/revenuecat.js missing after build.');
  process.exit(1);
}

console.log(`www/ built — ${ok}/${FILES.length} files + revenuecat.js`);
