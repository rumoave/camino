// Pre-generates high-quality ElevenLabs voice clips for every FIXED spoken line
// in the app (mock-interview officer + flashcards), so runtime playback never
// depends on the device's built-in robotic speechSynthesis voices.
//
// The corpus is extracted from app.js itself (run in a Node vm with DOM stubs)
// so it can never drift from what the app actually speaks:
//   - CIVICS (2008 test, 100 q)  — question EN + ES, correct answer EN
//   - CIVICS_2025 (128 q)        — question EN + ES, correct answer EN
//   - N400_REVIEW_QUESTIONS      — question EN (answers are user-specific → runtime fallback)
//   - Officer feedback lines     — encouragements + verdict stems
//
// Output: audio/tts/<sha1-16>.mp3 + audio/tts/manifest.json
// The manifest maps a normalized "lang|text" key to a filename; app.js does the
// same normalization at runtime (see clipKey() in app.js) — keep them in sync.
//
// Usage:
//   node scripts/generate-tts.js --dry-run          # list corpus + cost estimate, no API calls
//   node scripts/generate-tts.js                    # generate missing clips (incremental)
//   node scripts/generate-tts.js --limit 5          # generate just 5 clips (smoke test)
//   node scripts/generate-tts.js --force            # regenerate everything
//   node scripts/generate-tts.js --list-voices      # print voices available to your account
//   node scripts/generate-tts.js --voice <voiceId> --model eleven_multilingual_v2
//
// API key resolution order: --key flag, ELEVENLABS_API_KEY env var,
// config.local.js (elevenLabsApiKey field).

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audio', 'tts');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

// Rachel — warm, professional female voice; matches the app's existing
// pickOfficerVoice() preference. Override with --voice.
const DEFAULT_VOICE = '21m00Tcm4TlvDq8ikWAM';
// multilingual_v2: best quality + speaks the Spanish flashcard text with the
// same voice. eleven_turbo_v2_5 is half the credits if quota is tight.
const DEFAULT_MODEL = 'eleven_multilingual_v2';

// ---------- CLI ----------
const args = process.argv.slice(2);
function flag(name){ return args.includes('--' + name); }
function opt(name, dflt){
  const i = args.indexOf('--' + name);
  return (i !== -1 && args[i+1]) ? args[i+1] : dflt;
}
const DRY_RUN = flag('dry-run');
const FORCE = flag('force');
const LIST_VOICES = flag('list-voices');
const LIMIT = parseInt(opt('limit', '0'), 10) || 0;
const VOICE_ID = opt('voice', DEFAULT_VOICE);
const MODEL_ID = opt('model', DEFAULT_MODEL);

function resolveApiKey(){
  const cli = opt('key', null);
  if(cli) return cli;
  if(process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const cfgPath = path.join(ROOT, 'config.local.js');
  if(fs.existsSync(cfgPath)){
    try {
      const sandbox = { window: {} };
      vm.runInNewContext(fs.readFileSync(cfgPath, 'utf8'), sandbox);
      if(sandbox.window.CAMINO_CONFIG && sandbox.window.CAMINO_CONFIG.elevenLabsApiKey){
        return sandbox.window.CAMINO_CONFIG.elevenLabsApiKey;
      }
    } catch(e){ /* fall through */ }
  }
  return null;
}

// ---------- Corpus extraction (run app.js with DOM stubs) ----------
function extractAppData(){
  const src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const noop = () => {};
  const stubEl = () => ({
    addEventListener: noop, removeEventListener: noop, setAttribute: noop,
    getAttribute: () => null, appendChild: noop, removeChild: noop,
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    style: {}, innerHTML: '', textContent: '', value: '', focus: noop, blur: noop,
    querySelector: () => null, querySelectorAll: () => [], click: noop, remove: noop
  });
  const documentStub = {
    addEventListener: noop, removeEventListener: noop,
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    createElement: stubEl, body: stubEl(), documentElement: stubEl(),
    head: stubEl(), title: '', hidden: false
  };
  const storageStub = { getItem: () => null, setItem: noop, removeItem: noop, clear: noop };
  const sandbox = {
    console: { log: noop, warn: noop, error: noop },
    setTimeout: () => 0, clearTimeout: noop, setInterval: () => 0, clearInterval: noop,
    requestAnimationFrame: () => 0, cancelAnimationFrame: noop,
    localStorage: storageStub, sessionStorage: storageStub,
    navigator: { userAgent: 'node-tts-extract', language: 'en-US', mediaDevices: null },
    location: { href: 'http://localhost/', hostname: 'localhost', protocol: 'http:', search: '', hash: '' },
    history: { pushState: noop, replaceState: noop, back: noop },
    fetch: () => new Promise(noop),
    alert: noop, confirm: () => false, prompt: () => null,
    Audio: function(){ return { play: noop, pause: noop, addEventListener: noop }; },
    matchMedia: () => ({ matches: false, addListener: noop, addEventListener: noop }),
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Promise, Error
  };
  sandbox.addEventListener = noop;
  sandbox.removeEventListener = noop;
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = documentStub;
  try {
    vm.runInNewContext(src, sandbox, { filename: 'app.js', timeout: 20000 });
  } catch(e) {
    // Top-level init may fail on a missing stub AFTER the data arrays are
    // declared — tolerate it as long as the data we need made it out.
    console.warn('note: app.js top-level threw (' + e.message + ') — continuing with extracted data');
  }
  const need = ['CIVICS', 'CIVICS_2025', 'N400_REVIEW_QUESTIONS'];
  for(const n of need){
    if(!Array.isArray(sandbox[n]) || !sandbox[n].length){
      throw new Error('Could not extract ' + n + ' from app.js — the DOM stub needs updating.');
    }
  }
  return {
    CIVICS: sandbox.CIVICS,
    CIVICS_2025: sandbox.CIVICS_2025,
    N400_REVIEW_QUESTIONS: sandbox.N400_REVIEW_QUESTIONS
  };
}

// Must match clipKey() in app.js exactly.
function clipKey(lang, text){
  return lang + '|' + String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

// Mirror of humanizeOfficerText() in app.js — applied to the text we SEND to
// ElevenLabs (so pacing breathes) while the manifest key stays the raw text.
function humanize(text){
  let t = String(text);
  t = t.replace(/^(OK|Alright|All right|So|Now|Good morning|Good afternoon|Welcome|Question)\b\s*/i, (m, p1) => p1 + ', ');
  t = t.replace(/([?.!])(?=\S)/g, '$1 ');
  t = t.replace(/\.\.\.+/g, '. ');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function buildCorpus(data){
  const items = new Map(); // key → {lang, text, kind}
  function add(lang, text, kind){
    if(!text || !String(text).trim()) return;
    const key = clipKey(lang, text);
    if(!items.has(key)) items.set(key, { key, lang, text: String(text), kind });
  }

  for(const arr of [data.CIVICS, data.CIVICS_2025]){
    for(const q of arr){
      add('en', q.q.en, 'civics-question');
      add('es', q.q.es, 'civics-question-es');
      const correct = (q.options || []).find(o => o.correct);
      if(correct) add('en', correct.en, 'civics-answer');
    }
  }
  for(const q of data.N400_REVIEW_QUESTIONS){
    add('en', q.q.en, 'n400-question');
  }
  // Officer feedback — keep in sync with officerFeedbackText() in app.js.
  for(const t of ['Correct.', 'Good.', "That's right.", 'Yes.', 'Excellent.', 'Right.']){
    add('en', t, 'feedback');
  }
  add('en', 'Close enough. The expected answer is:', 'feedback-stem');
  add('en', 'The correct answer is:', 'feedback-stem');

  return [...items.values()];
}

// ---------- ElevenLabs API ----------
function apiRequest(method, apiPath, apiKey, body, binary){
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: apiPath,
      method,
      headers: Object.assign(
        { 'xi-api-key': apiKey },
        body ? { 'Content-Type': 'application/json' } : {}
      )
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if(res.statusCode >= 200 && res.statusCode < 300){
          resolve(binary ? buf : JSON.parse(buf.toString('utf8') || '{}'));
        } else {
          const err = new Error('HTTP ' + res.statusCode + ': ' + buf.toString('utf8').slice(0, 300));
          err.statusCode = res.statusCode;
          reject(err);
        }
      });
    });
    req.on('error', reject);
    if(body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function synthesize(apiKey, text, lang){
  const body = {
    text: humanize(text),
    model_id: MODEL_ID,
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true }
  };
  // multilingual models auto-detect, but a hint prevents EN-accented Spanish
  if(MODEL_ID.indexOf('multilingual') === -1 && lang === 'es') body.language_code = 'es';
  let attempt = 0;
  for(;;){
    try {
      return await apiRequest('POST', '/v1/text-to-speech/' + VOICE_ID + '?output_format=mp3_44100_96', apiKey, body, true);
    } catch(e){
      attempt++;
      if(attempt > 4 || (e.statusCode && e.statusCode !== 429 && e.statusCode < 500)) throw e;
      const wait = 1500 * Math.pow(2, attempt);
      process.stdout.write('  (retry in ' + (wait/1000) + 's: ' + e.message.split('\n')[0] + ')\n');
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

// ---------- Main ----------
(async function main(){
  if(LIST_VOICES){
    const apiKey = resolveApiKey();
    if(!apiKey){ console.error('No API key. Set ELEVENLABS_API_KEY or pass --key.'); process.exit(1); }
    const res = await apiRequest('GET', '/v1/voices', apiKey);
    for(const v of res.voices || []){
      console.log(v.voice_id + '  ' + v.name + (v.labels ? '  [' + Object.values(v.labels).join(', ') + ']' : ''));
    }
    return;
  }

  console.log('Extracting spoken corpus from app.js …');
  const data = extractAppData();
  const corpus = buildCorpus(data);

  // Stable filename per key; detect (astronomically unlikely) hash collisions.
  const seen = new Map();
  for(const item of corpus){
    item.file = crypto.createHash('sha1').update(item.key).digest('hex').slice(0, 16) + '.mp3';
    if(seen.has(item.file) && seen.get(item.file) !== item.key){
      throw new Error('Hash collision: ' + item.key + ' vs ' + seen.get(item.file));
    }
    seen.set(item.file, item.key);
  }

  const totalChars = corpus.reduce((s, i) => s + humanize(i.text).length, 0);
  const byKind = {};
  for(const i of corpus) byKind[i.kind] = (byKind[i.kind] || 0) + 1;

  console.log('\nCorpus: ' + corpus.length + ' clips, ' + totalChars.toLocaleString() + ' characters');
  for(const k of Object.keys(byKind)) console.log('  ' + k.padEnd(22) + byKind[k]);
  console.log('\nVoice: ' + VOICE_ID + '   Model: ' + MODEL_ID);
  const credits = MODEL_ID.includes('turbo') || MODEL_ID.includes('flash') ? Math.ceil(totalChars / 2) : totalChars;
  console.log('Estimated credits: ~' + credits.toLocaleString() +
    ' (Starter $5 = 30k, Creator $22 = 100k; turbo/flash models cost half)');

  if(DRY_RUN){
    console.log('\n--dry-run: no API calls made. Sample lines:');
    for(const i of corpus.slice(0, 8)) console.log('  [' + i.lang + '] ' + i.text.slice(0, 70));
    return;
  }

  const apiKey = resolveApiKey();
  if(!apiKey){
    console.error('\nNo ElevenLabs API key found. Provide one via:\n' +
      '  1. ELEVENLABS_API_KEY env var\n' +
      '  2. elevenLabsApiKey field in config.local.js\n' +
      '  3. --key <key> flag\n' +
      'Get one at https://elevenlabs.io → Profile → API Keys.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Incremental: keep existing clips unless --force.
  let todo = corpus.filter(i => FORCE || !fs.existsSync(path.join(OUT_DIR, i.file)));
  const skipped = corpus.length - todo.length;
  if(LIMIT > 0) todo = todo.slice(0, LIMIT);
  console.log('\nGenerating ' + todo.length + ' clips' + (skipped ? ' (' + skipped + ' already exist)' : '') + ' …');

  let done = 0, failed = 0;
  const CONCURRENCY = 3;
  const queue = todo.slice();
  async function worker(){
    for(;;){
      const item = queue.shift();
      if(!item) return;
      try {
        const mp3 = await synthesize(apiKey, item.text, item.lang);
        fs.writeFileSync(path.join(OUT_DIR, item.file), mp3);
        done++;
        process.stdout.write('  [' + (done + failed) + '/' + todo.length + '] ' + item.lang + ' ' + item.text.slice(0, 55) + '\n');
      } catch(e){
        failed++;
        console.error('  FAILED [' + item.lang + '] ' + item.text.slice(0, 55) + ' — ' + e.message.split('\n')[0]);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Manifest includes every corpus clip that exists on disk (not just this run).
  const clips = {};
  for(const item of corpus){
    if(fs.existsSync(path.join(OUT_DIR, item.file))) clips[item.key] = item.file;
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({
    version: 1,
    voice: VOICE_ID,
    model: MODEL_ID,
    clips
  }, null, 1));

  const totalMB = Object.values(clips)
    .reduce((s, f) => s + fs.statSync(path.join(OUT_DIR, f)).size, 0) / 1024 / 1024;
  console.log('\nDone: ' + done + ' generated, ' + failed + ' failed, ' +
    Object.keys(clips).length + '/' + corpus.length + ' clips on disk (' + totalMB.toFixed(1) + ' MB).');
  console.log('Manifest: ' + path.relative(ROOT, MANIFEST_PATH));
  if(failed) process.exitCode = 1;
})().catch(e => { console.error(e); process.exit(1); });
