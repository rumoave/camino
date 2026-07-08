// Copies the plain web app into www/ — the folder Capacitor bundles into the iOS app.
// No build step; this just stages the files. Excludes dev-only + native-incompatible files:
//   - config.local.js  (dev Anthropic key; Cami is disabled in v1)
//   - sw.js            (service worker; the app unregisters SWs and it isn't needed natively)
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'www');
const FILES = ['index.html', 'app.js', 'styles.css', 'manifest.json'];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let ok = 0;
for (const f of FILES) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(OUT, f)); ok++; console.log('  copied', f); }
  else console.warn('  MISSING (skipped):', f);
}
console.log(`www/ built — ${ok}/${FILES.length} files`);
