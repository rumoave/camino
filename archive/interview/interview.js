// Archived from app.js (ios-build commit 2947e37). See README.md in this folder.

// ---- app.js lines 3149-3209: N-400 review questions + expected answers. Context before: ""
// ===== INTERVIEW SIMULATOR =====
var N400_REVIEW_QUESTIONS = [
  {key:'name', icon:'person',
    q:{en:'What is your full name?', es:'¿Cuál es tu nombre completo?'},
    tip:{en:'State your full legal name exactly as on your N-400. Don\'t shorten.', es:'Di tu nombre completo legal exactamente como en tu N-400. No lo acortes.'}},
  {key:'country', icon:'globe',
    q:{en:'What is your country of birth?', es:'¿Cuál es tu país de nacimiento?'},
    tip:{en:'Name the country as it is on your birth certificate.', es:'Nombra el país como aparece en tu acta de nacimiento.'}},
  {key:'gcDate', icon:'id',
    q:{en:'When did you become a lawful permanent resident?', es:'¿Cuándo te hiciste residente permanente?'},
    tip:{en:'Give the exact date on your green card. Officers cross-check this.', es:'Da la fecha exacta de tu residencia. Los oficiales lo verifican.'}},
  {key:'married', icon:'ring',
    q:{en:'Are you currently married?', es:'¿Estás casado/a actualmente?'},
    tip:{en:'A simple yes or no. If yes, the officer will ask follow-up questions.', es:'Un sí o no. Si sí, habrá preguntas adicionales.'}},
  {key:'marriageDate', icon:'calendar', conditional:'married',
    q:{en:'On what date did you get married?', es:'¿En qué fecha te casaste?'},
    tip:{en:'Be exact. The officer matches against your marriage certificate.', es:'Sé exacto. El oficial verifica con tu acta de matrimonio.'}},
  {key:'trips', icon:'plane',
    q:{en:'In the last 5 years, have you taken any trip outside the U.S. longer than 6 months?', es:'En los últimos 5 años, ¿has hecho algún viaje fuera de EE.UU. de más de 6 meses?'},
    tip:{en:'A trip over 6 months can break continuous residence. Be honest. Passport stamps will show it.', es:'Un viaje de más de 6 meses puede romper la residencia continua. Sé honesto. Los sellos del pasaporte lo muestran.'}},
  {key:'crime', icon:'scales',
    q:{en:'Have you EVER been arrested, charged, cited, or detained by any law enforcement officer for any reason?', es:'¿Has sido ALGUNA VEZ arrestado, acusado, citado, o detenido por algún oficial por cualquier motivo?'},
    tip:{en:'Disclose EVERYTHING. Dismissed cases, traffic, juvenile, anything. The officer has your full background check.', es:'Revela TODO. Casos desestimados, tráfico, juvenil, lo que sea. El oficial tiene tu verificación completa.'}},
  {key:'taxes', icon:'bill',
    q:{en:'Have you filed all your federal income tax returns?', es:'¿Has presentado todas tus declaraciones de impuestos federales?'},
    tip:{en:'If you owe back taxes, disclose it AND bring proof of a payment plan with the IRS.', es:'Si debes impuestos, revélalo Y trae prueba de un plan de pago con el IRS.'}},
  {key:'support', icon:'doc',
    q:{en:'Do you support the Constitution and form of government of the United States?', es:'¿Apoyas la Constitución y la forma de gobierno de EE.UU.?'},
    tip:{en:'The answer is yes. This is one of the most important questions of the interview.', es:'La respuesta es sí. Es una de las preguntas más importantes de la entrevista.'}},
  {key:'oath', icon:'flagUS',
    q:{en:'Are you willing to take the Oath of Allegiance to the United States?', es:'¿Estás dispuesto/a a tomar el Juramento de Lealtad a EE.UU.?'},
    tip:{en:'Yes. The oath has 5 parts: renounce other allegiances, defend the Constitution, obey U.S. law, serve in the military if required, perform civil service if required.', es:'Sí. El juramento tiene 5 partes: renunciar a otras lealtades, defender la Constitución, obedecer la ley, servir en el ejército si es requerido, hacer servicio civil si es requerido.'}}
];

function expectedN400Answer(q){
  var k = q.key;
  if(k === 'name') return user.name || '–';
  if(k === 'country') return countryLabel(user.countryOfBirth || 'Other', lang);
  if(k === 'gcDate') return user.greenCardDate ? fmtDate(user.greenCardDate, lang) : '–';
  if(k === 'married') return user.marriedToCitizen ? (lang==='es'?'Sí':'Yes') : (lang==='es'?'No':'No');
  if(k === 'marriageDate') return user.marriageDate ? fmtDate(user.marriageDate, lang) : '–';
  if(k === 'trips'){
    if(user.monthsOutside === 'lt6') return (lang==='es' ? 'No' : 'No');
    if(user.monthsOutside === '6-18') return (lang==='es' ? 'No de un solo viaje, pero entre 6 y 18 meses en total' : 'No single trip, but 6 to 18 months total');
    if(user.monthsOutside === 'gt18') return (lang==='es' ? 'Sí. Consulta legal' : 'Yes. Legal consult');
    return (lang==='es' ? 'No estoy seguro' : 'Not sure');
  }
  if(k === 'crime') return user.criminalHistory ? (lang==='es' ? 'Sí. Debes revelar todo con tu abogado' : 'Yes. Disclose with your lawyer') : (lang==='es' ? 'No' : 'No');
  if(k === 'taxes') return (lang==='es' ? 'Sí, presento cada año' : 'Yes, I file every year');
  if(k === 'support') return (lang==='es' ? 'Sí' : 'Yes');
  if(k === 'oath') return (lang==='es' ? 'Sí, estoy dispuesto/a' : 'Yes, I am willing');
  return '–';
}

function expectedCivicsAnswer(qId){
  var q = findQ(qId);
  if(!q) return '–';
  for(var i=0;i<q.options.length;i++) if(q.options[i].correct) return q.options[i][lang];
  return '–';
}


// ---- app.js lines 3428-3555: Voice engine: recognizer setup, native speech plugin bridge. Context before: ""
// ===== VOICE INTERVIEW ENGINE (Web Speech API + lenient fuzzy matching) =====

var IntvVoice = {
  recognizer: null,
  officerVoice: null,
  initialized: false,
  micStream: null,        // persistent MediaStream so we don't re-prompt every turn
  mediaRecorder: null,
  audioChunks: [],
  // Audio analysis for the meter + voice activity detection
  audioCtx: null,
  analyser: null,
  meterRaf: null,
  // VAD state. Updated each animation frame from the analyser
  vad: {
    speechStartedAt: 0,    // ts when amplitude first crossed speech threshold (0 = none yet)
    lastSpeechAt: 0,       // ts of most recent above-threshold sample
    avgLevel: 0,           // exponential moving average. Used by pacing coach
    listenStartedAt: 0     // ts when current listen() began
  }
};

// Which speech recognizer to use. In the iOS app WKWebView has no working
// Web Speech API (and may expose a non-functional webkitSpeechRecognition), so
// we only trust the native plugin there; on the web, the browser's API.
function nativeSpeechPlugin(){
  return window.CapSpeech || (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SpeechRecognition) || null;
}
function speechRecognitionCtor(){
  if(Store.isNative()){
    var plug = nativeSpeechPlugin();
    IntvVoice.nativeSpeech = !!plug;
    return plug ? nativeSpeechCtor(plug) : null;
  }
  IntvVoice.nativeSpeech = false;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}
function voiceInputAvailable(){ return !!speechRecognitionCtor(); }
function isWebSpeechSupported(){ return voiceInputAvailable(); }

// Wraps @capacitor-community/speech-recognition in the Web Speech API shape the
// interview already drives: start/stop/abort, onresult(event.results) with
// isFinal + alternatives, onerror(event.error), onend. There is no VAD on the
// native side, so a pause of ~2s (or 15s total) ends the turn.
var _nativeSpeechCtor = null;
function nativeSpeechCtor(plug){
  if(_nativeSpeechCtor) return _nativeSpeechCtor;
  function NativeRec(){ this._listening = false; this._alts = []; this._handles = []; }
  NativeRec.prototype._emit = function(isFinal){
    if(!this.onresult) return;
    var alts = this._alts.length ? this._alts : [''];
    var result = alts.map(function(t){ return {transcript: t, confidence: isFinal ? 0.8 : 0.6}; });
    result.isFinal = isFinal;
    this.onresult({results: [result]});
  };
  NativeRec.prototype._clearTimers = function(){
    if(this._silence) clearTimeout(this._silence);
    if(this._max) clearTimeout(this._max);
    this._silence = this._max = null;
  };
  NativeRec.prototype._finish = function(){
    if(!this._listening) return;
    this._listening = false;
    this._clearTimers();
    try { plug.stop(); } catch(e){}
    try { plug.removeAllListeners && plug.removeAllListeners(); } catch(e){}
    if(this._alts.length) this._emit(true);
    if(this.onend) this.onend();
  };
  NativeRec.prototype.start = function(){
    var self = this;
    self._listening = true; self._alts = [];
    try { plug.removeAllListeners && plug.removeAllListeners(); } catch(e){}
    plug.addListener('partialResults', function(d){
      if(!self._listening) return;
      var m = (d && d.matches) || [];
      if(!m.length) return;
      self._alts = m.slice(0, 5);
      self._emit(false);
      if(self._silence) clearTimeout(self._silence);
      self._silence = setTimeout(function(){ self._finish(); }, 2000);
    });
    plug.addListener('listeningState', function(d){
      if(d && d.status === 'stopped' && self._listening) self._finish();
    });
    plug.requestPermissions().then(function(p){
      var st = p && (p.speechRecognition || p.microphone || 'granted');
      if(st === 'denied'){
        self._listening = false;
        if(self.onerror) self.onerror({error:'not-allowed'});
        if(self.onend) self.onend();
        return;
      }
      return plug.start({language: self.lang || 'en-US', maxResults: 5, partialResults: true, popup: false});
    }).then(function(){
      if(!self._listening) return;
      self._max = setTimeout(function(){ self._finish(); }, 15000);
    }).catch(function(e){
      self._listening = false;
      if(self.onerror) self.onerror({error: (e && /denied|permission/i.test(String(e.message||e))) ? 'not-allowed' : 'audio-capture'});
      if(self.onend) self.onend();
    });
  };
  NativeRec.prototype.stop = function(){ this._finish(); };
  NativeRec.prototype.abort = function(){ this._finish(); };
  _nativeSpeechCtor = NativeRec;
  return NativeRec;
}

function initIntvVoice(){
  if(IntvVoice.initialized) return;
  var SR = speechRecognitionCtor();
  if(SR){
    var rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    rec.lang = 'en-US';
    IntvVoice.recognizer = rec;
  }
  // Voice list often loads async; subscribe + try now
  if(ttsSupported()){
    try { window.speechSynthesis.onvoiceschanged = function(){ IntvVoice.officerVoice = pickOfficerVoice(); }; } catch(e){}
    IntvVoice.officerVoice = pickOfficerVoice();
  }
  IntvVoice.initialized = true;
}


// ---- app.js lines 3620-3642: Officer speech (speakAsOfficer / slow / internal). Context before: ""
function speakAsOfficer(text, onEnd){
  speakOfficerInternal(text, { rate: 0.95, pitch: 0.97 }, onEnd);
}

// Slower + clearer for "hear it spoken" pronunciation playback.
// 0.78 = "ESL-friendly textbook" tempo without sounding mocking.
function speakAsOfficerSlow(text, onEnd){
  speakOfficerInternal(text, { rate: 0.78, pitch: 0.97 }, onEnd);
}

function speakOfficerInternal(text, opts, onEnd){
  // Pre-generated clip first. The "slow" pronunciation variant reuses the same
  // clip at 0.8x with pitch preserved instead of shipping a second recording.
  var url = clipUrlFor('en', text);
  if(url){
    var slow = opts && opts.rate && opts.rate < 0.9;
    playVoiceClip(url, { playbackRate: slow ? 0.8 : 1.0 }, onEnd,
      function(){ speakOfficerLegacy(text, opts, onEnd); });
    return;
  }
  speakOfficerLegacy(text, opts, onEnd);
}


// ---- app.js lines 3660-3910: Hear-answer helper, mic recording, answer normalization. Context before: ""
// Public helper for verdict "Hear it spoken" button
function hearOfficialAnswer(){
  if(!intvState || !intvState.results.length) return;
  var last = intvState.results[intvState.results.length - 1];
  if(last && last.expected) speakAsOfficerSlow(last.expected);
}

async function ensureMicPermission(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    user.micPermission = 'unavailable';
    saveUser();
    return false;
  }
  // Keep an active stream around for the interview session. Avoids re-prompting per turn.
  if(IntvVoice.micStream && IntvVoice.micStream.active){
    user.micPermission = 'granted';
    return true;
  }
  try {
    var stream = await navigator.mediaDevices.getUserMedia({audio: true});
    IntvVoice.micStream = stream;
    user.micPermission = 'granted';
    saveUser();
    return true;
  } catch(e){
    user.micPermission = 'denied';
    saveUser();
    return false;
  }
}

function releaseMicStream(){
  if(IntvVoice.micStream){
    try { IntvVoice.micStream.getTracks().forEach(function(t){ t.stop(); }); } catch(e){}
    IntvVoice.micStream = null;
  }
}

function startAudioRecording(){
  if(!IntvVoice.micStream || !window.MediaRecorder) return;
  try {
    IntvVoice.audioChunks = [];
    var mimeType = '';
    var candidates = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'];
    for(var i=0;i<candidates.length;i++){
      if(MediaRecorder.isTypeSupported(candidates[i])){ mimeType = candidates[i]; break; }
    }
    var opts = mimeType ? {mimeType: mimeType} : {};
    var rec = new MediaRecorder(IntvVoice.micStream, opts);
    IntvVoice.mediaRecorder = rec;
    rec.ondataavailable = function(e){
      if(e.data && e.data.size > 0) IntvVoice.audioChunks.push(e.data);
    };
    rec.onstop = function(){
      if(IntvVoice.audioChunks.length === 0) return;
      var blob = new Blob(IntvVoice.audioChunks, {type: mimeType || 'audio/webm'});
      try {
        var url = URL.createObjectURL(blob);
        if(intvState) intvState.lastAudioUrl = url;
      } catch(e){}
      IntvVoice.audioChunks = [];
    };
    rec.start();
  } catch(e){
    // Recording is best-effort. The interview still works without it
  }
}

function stopAudioRecording(){
  if(IntvVoice.mediaRecorder && IntvVoice.mediaRecorder.state === 'recording'){
    try { IntvVoice.mediaRecorder.stop(); } catch(e){}
  }
}

function playUserAudio(url){
  if(!url) return;
  try {
    stopOfficerSpeaking();
    var audio = new Audio(url);
    audio.play().catch(function(){});
  } catch(e){}
}

function revokeAllAudioUrls(){
  if(!intvState || !intvState.results) return;
  for(var i=0;i<intvState.results.length;i++){
    var u = intvState.results[i].audioUrl;
    if(u) try { URL.revokeObjectURL(u); } catch(e){}
  }
}

// Lenient matching: normalize, expand number words, score by keyword hits + Levenshtein.
var INTV_NUM_WORDS = {
  'one':'1','two':'2','three':'3','four':'4','five':'5','six':'6','seven':'7','eight':'8','nine':'9','ten':'10',
  'eleven':'11','twelve':'12','thirteen':'13','fourteen':'14','fifteen':'15','sixteen':'16','seventeen':'17',
  'eighteen':'18','nineteen':'19','twenty':'20','twenty-one':'21','twenty-two':'22','twenty-three':'23',
  'twenty-four':'24','twenty-five':'25','twenty-six':'26','twenty-seven':'27','thirty':'30','forty':'40',
  'fifty':'50','sixty':'60','seventy':'70','eighty':'80','ninety':'90','hundred':'100','thousand':'1000'
};
var INTV_STOPWORDS = {'the':1,'a':1,'an':1,'of':1,'to':1,'in':1,'is':1,'was':1,'were':1,'and':1,'or':1,'on':1,'at':1,'for':1,'this':1,'that':1,'with':1,'by':1,'be':1,'are':1,'as':1,'from':1,'it':1,'i':1,'we':1,'my':1};

// Synonym map. Collapses paraphrase variants to a single canonical token before matching.
// Order matters: longer phrases first so e.g. "united states" doesn't get split to "us united states".
var INTV_SYNONYMS = [
  [/\b(u\s*s\s*a|u\s*s\s*of\s*a|united\s+states\s+of\s+america|the\s+united\s+states|america|american|americas)\b/g, 'unitedstates'],
  [/\bu\s*s\b/g, 'unitedstates'],
  [/\b(d\s*c|district\s+of\s+columbia)\b/g, 'washington'],
  [/\bvp\b/g, 'vicepresident'],
  [/\bv\s*p\b/g, 'vicepresident'],
  [/\bpotus\b/g, 'president'],
  [/\bscotus\b/g, 'supremecourt'],
  [/\bfdr\b/g, 'franklinrooseveltt'],
  [/\bsupreme\s+court\b/g, 'supremecourt'],
  [/\bvice\s+president\b/g, 'vicepresident'],
  [/\bcommander\s*[-\s]\s*in\s*[-\s]\s*chief\b/g, 'commanderinchief'],
  [/\bbill\s+of\s+rights\b/g, 'billofrights'],
  [/\bcivil\s+rights\b/g, 'civilrights'],
  [/\bdeclaration\s+of\s+independence\b/g, 'declarationofindependence'],
  [/\bchecks\s+and\s+balances\b/g, 'checksandbalances'],
  [/\bseparation\s+of\s+powers\b/g, 'separationofpowers'],
  [/\bhouse\s+of\s+representatives\b/g, 'houseofrepresentatives'],
  [/\bworld\s+war\s+(one|i)\b/g, 'worldwar1'],
  [/\bworld\s+war\s+(two|ii)\b/g, 'worldwar2'],
  [/\bcivil\s+war\b/g, 'civilwar'],
  [/\bnative\s+american(s)?\b/g, 'nativeamerican'],
  [/\b(american\s+indian|indian\s+tribe)(s)?\b/g, 'nativeamerican'],
  [/\bmartin\s+luther\s+king(\s+jr)?\b/g, 'mlk'],
  [/\bdonald\s+(j\.?\s+)?trump\b/g, 'trump'],
  [/\bjoe(seph)?\s+biden\b/g, 'biden'],
  // Year compounds: "seventeen seventy six" → "1776", "nineteen forty one" → "1941"
  [/\bseventeen\s+seventy\s+six\b/g, '1776'],
  [/\bseventeen\s+eighty\s+seven\b/g, '1787'],
  [/\beighteen\s+twelve\b/g, '1812'],
  [/\beighteen\s+sixty\s+(one|two|three|four|five)\b/g, '1865'],
  [/\bnineteen\s+fourteen\b/g, '1914'],
  [/\bnineteen\s+seventeen\b/g, '1917'],
  [/\bnineteen\s+forty\s+(one|two|three|four|five)\b/g, '1941'],
  [/\btwenty\s+oh\s+one\b/g, '2001'],
  [/\b(its|it\s+is|that\s+is|the\s+answer\s+is|the\s+answer\s+would\s+be|i\s+believe\s+it\s+is|the\s+correct\s+answer\s+is)\b/g, ''],
  [/\b(yeah|yep|yup|yes\s+sir|yes\s+maam|affirmative|correct|definitely|absolutely|of\s+course|sure)\b/g, 'yes'],
  [/\b(nope|nah|no\s+sir|no\s+maam|negative|never)\b/g, 'no'],

  // Common Web Speech mishears for civics proper nouns + tricky terms.
  // Left side = what the recognizer typically returns; right side = canonical token.
  [/\b(cherokees?|cherokee\s+nation|sherokee|cher\s*okie|sheh?\s*roki|chair\s+okie)\b/g, 'cherokee'],
  [/\b(iroquois|iroquoi|earache\s+way|earache\s+wah|earwig\s+way|iroquoy|ear\s+wak\s+way)\b/g, 'iroquois'],
  [/\b(choctaw|chocktaw|chock\s+talk|chalk\s+talk|chocktal)\b/g, 'choctaw'],
  [/\b(navajos?|navaho|nuv\s+a\s+ho|navi\s+ho)\b/g, 'navajo'],
  [/\b(sioux|sue\s*x?|cyu|seal\s*you)\b/g, 'sioux'],
  [/\b(apache|appache|a\s+pachi|a\s+pa\s+chi)\b/g, 'apache'],
  [/\b(franklin\s+roosevelt|franklyn\s+roosevelt|franklin\s+rosevelt|f\.?d\.?\s*r\.?)\b/g, 'franklinroosevelt'],
  [/\b(theodore\s+roosevelt|teddy\s+roosevelt|t\.?\s*r\.?)\b/g, 'theodoreroosevelt'],
  [/\b(woodrow\s+wilson|woodrow\s+wilkson|wood\s+row\s+wilson|wilson)\b/g, 'woodrowwilson'],
  [/\b(abraham\s+lincoln|abe\s+lincoln|abrah\s+lincoln|link\s+in|lincoln)\b/g, 'lincoln'],
  [/\b(james\s+madison|j\.?\s*madison|jim\s+madison|madisen|madison)\b/g, 'madison'],
  [/\b(alexander\s+hamilton|a\.?\s*hamilton|alex\s+hamilton|hamilton)\b/g, 'hamilton'],
  [/\b(thomas\s+jefferson|t\.?\s*jefferson|tom\s+jefferson|jefferson)\b/g, 'jefferson'],
  [/\b(george\s+washington|g\.?\s*washington|gw\b|washington)\b/g, 'washington'],
  [/\b(j\.?d\.?\s*vance|jd\s+vance|judy\s+vance|jaydee\s+vance|vance)\b/g, 'vance'],
  [/\b(kamala\s+harris|camilla\s+harris|kamla\s+harris|harris)\b/g, 'harris'],
  [/\b(mike\s+johnson|mic\s+johnson|johnson)\b/g, 'mikejohnson'],

  // Tricky civic vocab that gets mangled
  [/\b(naturalization|nature\s+li[sz]ation|natural\s+li[sz]ation|naturalisation)\b/g, 'naturalization'],
  [/\b(amendment|a\s+mendment|moment|amount|amendmen)s?\b/g, 'amendment'],
  [/\b(constitution|constitut?ion|constituent|construction|constitu)\b/g, 'constitution'],
  [/\b(legislative|legislat?ive|legislator)\b/g, 'legislative'],
  [/\b(executive|exec(?:utive|tive))\b/g, 'executive'],
  [/\b(judicial|judician|judiciary)\b/g, 'judicial'],
  [/\b(emancipation|emancipat?ion|man[sz]ipation)\b/g, 'emancipation'],
  [/\b(missippi|mississippi|miss?i?sippi|miss\s+i\s+sippi)\b/g, 'mississippi'],
  [/\b(missouri|misery|missour\s+i|miss\s+oo\s+ree)\b/g, 'missouri'],
  [/\b(senate\s+seat|senate\s+ad|senate)\b/g, 'senate'],
  [/\b(suffrage|sufferage|suff\s+rage)\b/g, 'suffrage'],
  [/\b(allegiance|allegan\s+ce|allegience|a\s+legions?)\b/g, 'allegiance'],
  [/\b(pursuit\s+of\s+happiness|pursu(?:e|et)\s+of\s+happiness)\b/g, 'pursuitofhappiness'],
  [/\b(martin\s+luther\s+king(\s+junior)?|martin\s+lu(?:dder|der)\s+king|m\.?l\.?k\.?)\b/g, 'mlk'],

  // Forms of "Mr./Mrs." prefixes that some recognizers insert
  [/\b(mr|mister|mrs|missus|miss|ms)\b/g, '']
];

function normalizeIntvAnswer(s){
  if(!s) return '';
  var t = String(s).toLowerCase();
  // Fold accents so "México" and "Mexico" compare equal; a bare Spanish "sí" is a yes.
  try { t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch(e){}
  if(/^\s*(si|si si)\s*$/.test(t)) t = 'yes';
  t = t.replace(/[^\w\s'.-]/g, ' ')
    .replace(/\b(um|uh|er|ah|hmm|like|i think|i mean|so|well|i would say|you know)\b/g, ' ');
  // Synonym expansion first (canonicalize multi-word phrases)
  for(var i=0;i<INTV_SYNONYMS.length;i++) t = t.replace(INTV_SYNONYMS[i][0], INTV_SYNONYMS[i][1]);
  // Multi-word number compounds (must run BEFORE single-word number-to-digit conversion).
  // "twenty seven" → "27", "four hundred thirty five" → "435", etc.
  t = t.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[\s-]+(one|two|three|four|five|six|seven|eight|nine)\b/g, function(m, tens, ones){
    var tensMap = {twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
    var onesMap = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9};
    return String(tensMap[tens] + onesMap[ones]);
  });
  // "X hundred [and] Y[Z]" → composite (e.g. "four hundred thirty-five" → "435")
  t = t.replace(/\b(one|two|three|four|five|six|seven|eight|nine)\s+hundred(?:\s+and)?(?:\s+(\d+))?/g, function(m, h, tail){
    var hMap = {one:100,two:200,three:300,four:400,five:500,six:600,seven:700,eight:800,nine:900};
    var n = hMap[h] + (tail ? parseInt(tail,10) : 0);
    return String(n);
  });
  // Single-word number → digit
  Object.keys(INTV_NUM_WORDS).forEach(function(w){
    t = t.replace(new RegExp('\\b'+w+'\\b','g'), INTV_NUM_WORDS[w]);
  });
  // Strip stray punctuation that survived (periods inside abbreviations)
  t = t.replace(/[.]/g, ' ').replace(/\s+/g,' ').trim();
  return t;
}

// Lightweight "metaphone-like" phonetic encoder. NOT exact metaphone. Tuned
// for civics vocabulary and the Web Speech API's common substitutions.
// "iroquois" / "earache way" → "irki" / "rwy" (close enough for fallback match)
// "lincoln" / "link in" → "lnkn" / "lnkn" (exact)
// "naturalization" / "nature lization" → "ntrlztn" / "ntrlztn" (exact)
function phoneticCode(s){
  if(!s) return '';
  var t = String(s).toLowerCase().replace(/[^a-z\s]/g,'');
  if(!t) return '';
  // Apply digraph + silent-letter substitutions first
  t = t.replace(/ph/g,'f')
       .replace(/ck/g,'k')
       .replace(/cq/g,'k')
       .replace(/qu/g,'kw')
       .replace(/q/g,'k')
       .replace(/x/g,'ks')
       .replace(/sh/g,'s')
       .replace(/ch/g,'c')
       .replace(/th/g,'t')
       .replace(/wh/g,'w')
       .replace(/gh/g,'')
       .replace(/dg/g,'j')
       .replace(/z/g,'s');
  // Drop silent w/h between consonants
  t = t.replace(/(?<=[bcdfgjklmnpqrstv])[wh]/g, '');
  // Drop all vowels (preserve word boundaries with space). Keeps consonant skeleton
  t = t.split(/\s+/).map(function(w){
    if(!w) return '';
    var first = w.charAt(0);
    var rest = w.slice(1).replace(/[aeiouy]/g, '');
    return first + rest;
  }).join(' ');
  // Collapse runs of the same letter
  t = t.replace(/(.)\1+/g, '$1');
  return t.replace(/\s+/g,' ').trim();
}


// ---- app.js lines 3928-4149: Answer matching, accepted variants, N-400 expected answers. Context before: ""
function intvEscapeRe(x){ return String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
// Whole-word phrase containment: "the" is not inside "the constitution", "4" is not inside "435".
function intvPhraseContains(hay, needle){
  if(!needle) return false;
  return new RegExp('(^|\\s)' + intvEscapeRe(needle).replace(/\s+/g, '\\s+') + '(\\s|$)').test(hay);
}
function intvKeywordCount(t){
  return t.split(/\s+/).filter(function(w){ return w && !INTV_STOPWORDS[w] && (w.length > 1 || /\d/.test(w)); }).length;
}

function intvKeywordScore(transcript, expected){
  // Keep digit-only keys (like "6", "27", "1776"). They're meaningful, just short.
  var keys = expected.split(/\s+/).filter(function(w){
    if(INTV_STOPWORDS[w]) return false;
    if(w.length > 1) return true;
    return /\d/.test(w); // single digits are real signal
  });
  if(!keys.length) return transcript.indexOf(expected) !== -1 ? 1 : 0;
  var tWords = transcript.split(/\s+/);
  // Pre-compute phonetic codes once per call so we don't recompute for every key
  var tPhonetics = tWords.map(phoneticCode);
  var hits = 0;
  keys.forEach(function(k){
    if(new RegExp('(^|\\s)' + intvEscapeRe(k) + '(\\s|$)').test(transcript)){ hits++; return; }
    if(/\d/.test(k)) return;            // numbers and dates must match exactly: 2023 is not 2020, 13 is not 3
    if(k.length < 4) return;
    var tol = Math.max(1, Math.floor(k.length / 4));
    // Fuzzy single-word match (accent-driven typos)
    for(var i=0;i<tWords.length;i++){
      if(tWords[i].length >= 4 && Math.abs(tWords[i].length - k.length) <= tol &&
         levenshteinIntv(tWords[i], k) <= tol){ hits++; return; }
    }
    // Phonetic fallback. Catches unseen mishears not in the synonym map
    var kPhon = phoneticCode(k);
    if(kPhon.length >= 3){
      for(var p=0;p<tPhonetics.length;p++){
        if(tPhonetics[p] && tPhonetics[p].length >= 3
           // equal codes or one edit apart (plurals, small mishears). No containment:
           // "president" must not ride along inside "vicepresident".
           && (tPhonetics[p] === kPhon || levenshteinIntv(tPhonetics[p], kPhon) <= 1)){
          hits += 0.85; // weight slightly below exact match to avoid over-crediting
          return;
        }
      }
    }
  });
  return Math.min(1, hits / keys.length);
}

function evaluateIntvAnswer(transcript, expectedVariants){
  if(!transcript || !transcript.trim()){
    return {verdict:'wrong', score:0, matched:null, heard:'', topMatches:[]};
  }
  var t = normalizeIntvAnswer(transcript);
  if(!expectedVariants || !expectedVariants.length){
    return {verdict:'wrong', score:0, matched:null, heard:transcript, topMatches:[]};
  }
  // Score EVERY variant, then sort to surface "did you mean?" candidates
  var scored = [];
  for(var i=0;i<expectedVariants.length;i++){
    var v = normalizeIntvAnswer(expectedVariants[i]);
    if(!v) continue;
    var s;
    if(t === v || intvPhraseContains(t, v)){
      s = 1;                                   // the expected answer appears whole in what was said
    } else if(intvPhraseContains(v, t) && intvKeywordCount(t) >= Math.max(1, Math.ceil(intvKeywordCount(v) * 0.6))){
      s = 1;                                   // said most of a longer expected phrase ("Constitution" for "the Constitution")
    } else {
      s = intvKeywordScore(t, v);
    }
    scored.push({ variant: expectedVariants[i], score: s });
  }
  scored.sort(function(a,b){ return b.score - a.score; });
  var best = scored.length ? scored[0].score : 0;
  var bestMatch = scored.length ? scored[0].variant : expectedVariants[0];
  // Top suggestions for the "Did you mean?" panel. Meaningfully-scored, distinct ones
  var topMatches = [];
  var seen = {};
  for(var k=0;k<scored.length && topMatches.length < 3;k++){
    var key = scored[k].variant.toLowerCase();
    if(seen[key]) continue;
    if(scored[k].score < 0.05) break;
    seen[key] = true;
    topMatches.push(scored[k].variant);
  }
  var verdict = 'wrong';
  if(best >= 0.6) verdict = 'correct';
  else if(best >= 0.3) verdict = 'close';
  return {verdict:verdict, score:best, matched:bestMatch, heard:transcript, topMatches:topMatches};
}

// Acceptable-answer variants for the trickier civics questions where keyword-match alone
// might miss. Indexed by civics question ID. For most questions, the keyword matcher
// against the official answer is enough. These are explicit alternates.
var INTERVIEW_VARIANTS = {
  1:  ['Constitution','the Constitution','U.S. Constitution','United States Constitution','American Constitution','supreme law'],
  2:  ['sets up the government','defines the government','protects basic rights','protects the rights of Americans','it sets up the government'],
  3:  ['We the People','the people','We the People of the United States','American people','citizens'],
  4:  ['amendment','an amendment','a change','change to the Constitution'],
  5:  ['Bill of Rights','the Bill of Rights','first ten amendments','the first 10 amendments'],
  6:  ['speech','religion','assembly','press','petition','freedom of speech','freedom of religion','right to assembly','freedom of the press','right to petition the government'],
  7:  ['27','twenty-seven','twenty seven'],
  8:  ['announced our independence','declared our independence','declared independence from Great Britain','said we are free'],
  9:  ['life','liberty','pursuit of happiness','life and liberty','life liberty and the pursuit of happiness'],
  10: ['economic system','market economy','capitalist economy','capitalism','free market'],
  11: ['the rule of law','rule of law','no one is above the law','government must obey the law','everyone must follow the law','leaders must obey the law'],
  13: ['three branches','three','legislative executive judicial','3 branches','3','Congress President courts'],
  14: ['checks and balances','separation of powers','separation of powers and checks and balances'],
  15: ['the President','President','POTUS'],
  16: ['Congress','the Congress','Senate and House','Senate and House of Representatives'],
  17: ['Senate','House','Senate and House','Congress'],
  18: ['100','one hundred','a hundred'],
  19: ['6','six','six years'],
  21: ['435','four hundred thirty-five','four hundred and thirty-five'],
  22: ['2','two','two years'],
  24: ['all people of the state','all people in the state','everyone in the state','citizens of the state','all the people in the state'],
  25: ['because of the state population','more people','the state has more people','larger population','population'],
  26: ['4','four','four years'],
  27: ['November','November of'],
  28: ['Donald Trump','Donald J. Trump','Trump','Joseph Biden','Joe Biden','Biden'],
  29: ['J.D. Vance','Vance','JD Vance','Kamala Harris','Harris'],
  30: ['the Vice President','Vice President','VP'],
  31: ['the Speaker of the House','Speaker of the House','speaker'],
  32: ['the President','President','Commander in Chief','commander-in-chief'],
  33: ['the President','President'],
  34: ['the Senate','Senate'],
  35: ['the President','President'],
  36: ['Cabinet','advise the president','presidential advisors'],
  37: ['Vice President','Secretary of State','Secretary of Defense','Attorney General','Secretary of Treasury','Secretary of Labor','Secretary of Education','Secretary of Energy','Secretary of Commerce','Secretary of Agriculture','Secretary of Interior','Secretary of Health and Human Services','Secretary of Housing and Urban Development','Secretary of Transportation','Secretary of Veterans Affairs','Secretary of Homeland Security'],
  38: ['reviews laws','explains laws','resolves disputes','decides if a law goes against the Constitution','interprets laws'],
  39: ['the Supreme Court','Supreme Court'],
  40: ['9','nine','8','eight'],
  44: ['Washington DC','Washington','D.C.','District of Columbia','Washington, D.C.'],
  45: ['Republican','Democrat','Republican and Democratic','Democratic Party','Republican Party'],
  46: ['Republican','Democratic','Democrat'],
  47: ['Mike Johnson','Johnson','Speaker Johnson'],
  48: ['18','eighteen'],
  50: ['vote','run for federal office','serve on a jury','bring family from abroad','apply for federal jobs','carry a U.S. passport'],
  51: ['freedom of expression','freedom of speech','freedom of assembly','freedom to petition the government','freedom of religion','right to bear arms'],
  52: ['the United States','the flag'],
  53: ['give up loyalty to other countries','defend the Constitution and laws of the United States','obey the laws','serve in the U.S. military if needed','serve the nation if needed','be loyal to the United States'],
  54: ['18 and older','eighteen','18'],
  55: ['vote','join a political party','help with a campaign','call senators and representatives','run for office','give an elected official your opinion'],
  56: ['April 15','April fifteenth','April 15th'],
  57: ['at age 18','between 18 and 26','men 18 to 25','men between 18 and 25'],
  58: ['freedom','political liberty','religious freedom','economic opportunity','escape persecution'],
  59: ['American Indians','Native Americans','the Indians'],
  60: ['Africans','people from Africa'],
  61: ['high taxes','taxation without representation','because the British army stayed in their houses','British soldiers stayed in their houses','because they did not have self-government'],
  62: ['Thomas Jefferson','Jefferson'],
  63: ['July 4 1776','July 4th 1776','July fourth 1776','seventeen seventy-six','1776'],
  64: ['New Hampshire','Massachusetts','Rhode Island','Connecticut','New York','New Jersey','Pennsylvania','Delaware','Maryland','Virginia','North Carolina','South Carolina','Georgia'],
  65: ['the Constitution was written','the Founding Fathers wrote the Constitution'],
  66: ['1787','seventeen eighty-seven'],
  67: ['James Madison','Alexander Hamilton','John Jay','Publius','Madison','Hamilton'],
  68: ['founder of the free public schools','first Postmaster General of the United States','writer of Poor Richard\'s Almanac','started the first free libraries','U.S. diplomat'],
  69: ['George Washington','Washington'],
  70: ['George Washington','Washington'],
  71: ['the Louisiana Territory','Louisiana'],
  72: ['War of 1812','Mexican-American War','Civil War','Spanish-American War'],
  73: ['the Civil War','War Between the States','Civil War','War Between the States'],
  74: ['slavery','economic reasons','states\' rights','slavery economic and states rights'],
  75: ['freed the slaves','Emancipation Proclamation','saved the Union','led the United States during the Civil War'],
  76: ['freed the slaves','freed slaves in the Confederacy','freed slaves in the Confederate states'],
  77: ['fought for women\'s rights','fought for civil rights','women\'s suffrage'],
  78: ['World War I','World War II','Korean War','Vietnam War','Persian Gulf War'],
  79: ['Woodrow Wilson','Wilson'],
  80: ['Franklin Roosevelt','FDR','Roosevelt'],
  81: ['Japan Germany and Italy','Japan, Germany, and Italy','Japan Germany Italy'],
  82: ['World War II','the second World War','WWII'],
  83: ['communism','the spread of communism'],
  84: ['civil rights movement','civil rights'],
  85: ['fought for civil rights','worked for equality for all Americans','I have a dream','equal rights'],
  86: ['terrorists attacked the United States','9/11','September 11','attacks on the World Trade Center'],
  87: ['Cherokee','Navajo','Sioux','Chippewa','Choctaw','Pueblo','Apache','Iroquois','Creek','Blackfeet','Seminole','Cheyenne','Arawak','Shawnee','Mohegan','Huron','Oneida','Lakota','Crow','Teton','Hopi','Inuit'],
  88: ['Missouri','Mississippi'],
  89: ['Pacific','Pacific Ocean'],
  90: ['Atlantic','Atlantic Ocean'],
  91: ['Puerto Rico','U.S. Virgin Islands','American Samoa','Northern Mariana Islands','Guam'],
  92: ['Maine','New Hampshire','Vermont','New York','Pennsylvania','Ohio','Michigan','Minnesota','North Dakota','Montana','Idaho','Washington','Alaska'],
  93: ['California','Arizona','New Mexico','Texas'],
  94: ['Washington DC','Washington','D.C.'],
  95: ['New York Harbor','Liberty Island','New York','New Jersey'],
  96: ['because there were 13 original colonies','they represent the original colonies'],
  97: ['because there is one star for each state','one star for each state','50 stars for 50 states'],
  98: ['The Star-Spangled Banner','Star Spangled Banner','national anthem'],
  99: ['July 4','July fourth','Independence Day'],
  100:['New Year\'s Day','Martin Luther King Jr Day','Presidents Day','Memorial Day','Independence Day','Labor Day','Columbus Day','Veterans Day','Thanksgiving','Christmas','Juneteenth']
};

// Acceptable variants for N-400 personal questions (English, deterministic per-user)
function expectedN400AnswerEn(q){
  var k = q.key;
  if(k === 'name'){
    var n = (user.name||'').trim();
    return n ? [n, n.split(' ')[0]] : ['–'];
  }
  if(k === 'country'){
    var c = countryLabel(user.countryOfBirth || 'Other', 'en');
    return [c];
  }
  if(k === 'gcDate'){
    var d = user.greenCardDate ? fmtDate(user.greenCardDate, 'en') : '–';
    return [d];
  }
  if(k === 'married') return isUserMarried() ? ['yes','I am','I am married'] : ['no','I am not','I am not married','single'];
  if(k === 'marriageDate'){
    var md = user.marriageDate ? fmtDate(user.marriageDate, 'en') : '–';
    return [md];
  }
  if(k === 'trips'){
    if(user.monthsOutside === 'lt6') return ['no','none','no I have not','no I have not taken any'];
    if(user.monthsOutside === '6-18') return ['no single trip','no but my total was','between six and eighteen months total'];
    if(user.monthsOutside === 'gt18') return ['yes','more than six months','a trip over six months'];
    return ['I am not sure','not sure'];
  }
  if(k === 'crime') return user.criminalHistory ? ['yes','yes I have'] : ['no','no I have not','never'];
  if(k === 'taxes') return ['yes','I have','yes I have','I file every year'];
  if(k === 'support') return ['yes','I do','yes I do'];
  if(k === 'oath') return ['yes','I am','I am willing','yes I am willing'];
  return ['–'];
}

// ---- app.js lines 4331-4391: Daily limit, accepted variants, session state and size. Context before: ""
// Voice-interview state, count, results
function todayInterviewsAvailable(){
  if(isPlus()) return Infinity;
  if(user.voiceInterviewsTodayDate !== todayISO()) return 3;
  return Math.max(0, 3 - (user.voiceInterviewsTodayCount || 0));
}

function recordInterviewStart(){
  if(isPlus()) return;
  if(user.voiceInterviewsTodayDate !== todayISO()){
    user.voiceInterviewsTodayCount = 0;
    user.voiceInterviewsTodayDate = todayISO();
  }
  user.voiceInterviewsTodayCount = (user.voiceInterviewsTodayCount || 0) + 1;
  saveUser();
}

function getAcceptedVariants(q){
  if(q.type === 'civics'){
    var cq = findQ(q.qId);
    if(!cq) return [];
    var v = [];
    // State-specific questions: the user's saved answer is the expected one
    // (each senator's name on its own counts).
    var sa = stateAnswerFor(q.qId);
    if(sa){
      v.push(sa);
      sa.split(/\s*(?:,|&| and | y )\s*/i).forEach(function(part){ if(part && part.trim().length > 2) v.push(part.trim()); });
      return v;
    }
    for(var i=0;i<cq.options.length;i++) if(cq.options[i].correct) v.push(cq.options[i].en);
    var extra = ACCEPT_2025[q.qId] || INTERVIEW_VARIANTS[q.qId];
    if(extra) v = v.concat(extra);
    return v;
  } else {
    return expectedN400AnswerEn(q.n400Q);
  }
}

function getQuestionTextEn(q){
  if(q.type === 'civics'){
    var cq = findQ(q.qId);
    return cq ? cq.q.en : '';
  }
  return q.n400Q.q.en;
}

function getQuestionTextLocal(q){
  if(q.type === 'civics'){
    var cq = findQ(q.qId);
    return cq ? cq.q[lang] : '';
  }
  return q.n400Q.q[lang];
}

var intvState = null;

// Session shape: 6 civics questions from the user's test-version pool (weak
// spots first) plus 3 N-400 review questions, so the pass mark reflects civics.
var INTERVIEW_CIVICS_N = 6, INTERVIEW_N400_N = 3;
function interviewQuestionCount(){ return INTERVIEW_CIVICS_N + INTERVIEW_N400_N; }

// ---- app.js lines 4397-4456: Building, starting and exiting a session. Context before: "}"
function buildInterviewQuestions(){
  var civicsIds = adaptiveCivicsQIds(INTERVIEW_CIVICS_N);
  var civicsQs = civicsIds.map(function(id){return {type:'civics', qId:id};});
  var applicableN400 = N400_REVIEW_QUESTIONS.filter(function(q){
    if(q.conditional === 'married') return isUserMarried();
    return true;
  });
  // Always open with the name question (that is how the real interview starts), then sample the rest.
  var first = applicableN400.filter(function(q){ return q.key === 'name'; });
  var rest = shuffleArr(applicableN400.filter(function(q){ return q.key !== 'name'; })).slice(0, Math.max(0, INTERVIEW_N400_N - first.length));
  var sample = first.concat(rest);
  var ordered = [];
  if(sample[0]) ordered.push({type:'n400', n400Q: sample[0]});
  ordered = ordered.concat(civicsQs.slice(0,3));
  for(var k=1;k<sample.length;k++) ordered.push({type:'n400', n400Q: sample[k]});
  ordered = ordered.concat(civicsQs.slice(3));
  return ordered;
}

function startInterview(){
  // Daily cap (3/day for free, unlimited for Plus)
  var avail = todayInterviewsAvailable();
  if(avail <= 0){
    toast(lang==='es' ? 'Llegaste al límite diario · Plus = ilimitado' : 'Daily limit reached · Plus = unlimited');
    go('upgrade');
    return;
  }
  recordInterviewStart();
  initIntvVoice();
  intvState = {
    qIdx: 0,
    questions: buildInterviewQuestions(),
    results: [],
    phase: 'asking',        // 'asking' | 'ready' | 'listening' | 'lowConfidence' | 'verdict' | 'done'
    currentTranscript: '',
    finalAlternatives: [],
    liveConfidence: 0,
    handsFree: (user && user.intvHandsFree) || false, // persisted preference
    autoAdvanceTimer: null,
    micEnabled: !!IntvVoice.recognizer,
    fallbackText: '',
    currentStreak: 0,       // consecutive 'correct' verdicts this session
    bestStreak: 0,
    justIncrementedStreak: false  // one-tick flag for the pulse animation
  };
  go('interview');
  renderInterview();
  setTimeout(function(){ officerAsks(); }, 600);
}

function exitInterview(){
  stopOfficerSpeaking();
  stopListening();
  stopAudioRecording();
  revokeAllAudioUrls();
  releaseMicStream();
  intvState = null;
  go('home');
}


// ---- app.js lines 4462-5389: Listening, mic meter, grading, feedback, rendering, results, Home card. Context before: ""
function stopListening(){
  if(IntvVoice.recognizer){
    try { IntvVoice.recognizer.abort(); } catch(e){}
    try { IntvVoice.recognizer.stop(); } catch(e){}
  }
  stopMicLevelMeter();
}

// Real-time audio level meter driven by the live mic stream.
// Drives the 5 bars in .intvMicLevel so users SEE the recognizer is actually working.
function startMicLevelMeter(){
  if(!IntvVoice.micStream) return;
  try {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    if(IntvVoice.audioCtx){ try { IntvVoice.audioCtx.close(); } catch(e){} IntvVoice.audioCtx = null; }
    var ctx = new Ctx();
    var src = ctx.createMediaStreamSource(IntvVoice.micStream);
    var analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser);
    IntvVoice.audioCtx = ctx;
    IntvVoice.analyser = analyser;

    var data = new Uint8Array(analyser.fftSize);
    var now0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    IntvVoice.vad.listenStartedAt = now0;
    IntvVoice.vad.speechStartedAt = 0;
    IntvVoice.vad.lastSpeechAt = 0;
    IntvVoice.vad.avgLevel = 0;
    // Ambient noise calibration. Sample for ~400ms before raising the speech threshold
    // so users in noisy environments don't get false triggers (HVAC, traffic, etc.).
    IntvVoice.vad.calibrating = true;
    IntvVoice.vad.calibrationMax = 0;
    IntvVoice.vad.noiseFloor = 0;
    var CALIBRATION_MS = 400;

    var SPEECH_THRESH = 0.18;    // baseline amplitude above which we believe the user is talking
    var SILENCE_END_MS = 1500;   // ms of post-speech silence → auto-stop (VAD)
    var MAX_LISTEN_MS = 30000;   // hard cap so a stuck recognizer doesn't run forever
    var NO_SPEECH_HINT_MS = 4000;

    function tick(){
      if(!intvState || intvState.phase !== 'listening'){
        IntvVoice.meterRaf = null;
        return;
      }
      analyser.getByteTimeDomainData(data);
      var peak = 0;
      for(var i=0;i<data.length;i++){
        var v = Math.abs(data[i] - 128);
        if(v > peak) peak = v;
      }
      var level = Math.min(1, peak / 50);
      var t = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
      // Exponential moving average of level. Drives pacing coach
      IntvVoice.vad.avgLevel = IntvVoice.vad.avgLevel * 0.85 + level * 0.15;

      // Ambient calibration: for the first 400ms, treat all input as noise.
      // After that, raise SPEECH_THRESH above the measured noise floor + headroom.
      if(IntvVoice.vad.calibrating){
        if(level > IntvVoice.vad.calibrationMax) IntvVoice.vad.calibrationMax = level;
        if((t - IntvVoice.vad.listenStartedAt) > CALIBRATION_MS){
          IntvVoice.vad.calibrating = false;
          IntvVoice.vad.noiseFloor = IntvVoice.vad.calibrationMax;
          // Push threshold above noise floor with headroom; clamp to a sane range
          SPEECH_THRESH = Math.min(0.45, Math.max(0.18, IntvVoice.vad.noiseFloor + 0.10));
        }
      }

      var bars = document.querySelectorAll('.intvMicLevelBar');
      if(bars.length){
        for(var b=0;b<bars.length;b++){
          var threshold = (b + 1) / bars.length;
          var lit = level >= threshold * 0.85;
          bars[b].style.opacity = lit ? '1' : '0.18';
          bars[b].style.transform = 'scaleY(' + (0.3 + level * (0.7 + b * 0.06)) + ')';
        }
      }

      // VAD: track speech start + last speech moment
      if(level >= SPEECH_THRESH){
        if(!IntvVoice.vad.speechStartedAt) IntvVoice.vad.speechStartedAt = t;
        IntvVoice.vad.lastSpeechAt = t;
      }
      // Pacing coach line. Gentle hints
      var hint = '';
      if(!IntvVoice.vad.speechStartedAt && (t - IntvVoice.vad.listenStartedAt) > NO_SPEECH_HINT_MS){
        hint = lang==='es' ? 'Tómate tu tiempo · habla más cerca del micrófono' : "Take your time · speak closer to the mic";
      } else if(IntvVoice.vad.speechStartedAt && IntvVoice.vad.avgLevel < 0.06){
        hint = lang==='es' ? 'Habla un poco más fuerte' : 'Speak up a little';
      }
      var hintEl = document.getElementById('intvPacingHint');
      if(hintEl) hintEl.textContent = hint;

      // Auto-stop on silence after speech (hands-free or not. Keeps recognition snappy)
      if(IntvVoice.vad.lastSpeechAt && (t - IntvVoice.vad.lastSpeechAt) > SILENCE_END_MS){
        try { IntvVoice.recognizer && IntvVoice.recognizer.stop(); } catch(e){}
        IntvVoice.meterRaf = null;
        return;
      }
      // Hard cap so a hung session doesn't loop forever
      if((t - IntvVoice.vad.listenStartedAt) > MAX_LISTEN_MS){
        try { IntvVoice.recognizer && IntvVoice.recognizer.stop(); } catch(e){}
        IntvVoice.meterRaf = null;
        return;
      }
      IntvVoice.meterRaf = requestAnimationFrame(tick);
    }
    IntvVoice.meterRaf = requestAnimationFrame(tick);
  } catch(e){ /* AudioContext denied or stream unsupported. Silent fallback */ }
}

function stopMicLevelMeter(){
  if(IntvVoice.meterRaf){ cancelAnimationFrame(IntvVoice.meterRaf); IntvVoice.meterRaf = null; }
  if(IntvVoice.audioCtx){
    try { IntvVoice.audioCtx.close(); } catch(e){}
    IntvVoice.audioCtx = null;
    IntvVoice.analyser = null;
  }
  // Reset bar styles
  var bars = document.querySelectorAll('.intvMicLevelBar');
  for(var i=0;i<bars.length;i++){ bars[i].style.opacity=''; bars[i].style.transform=''; }
}

function officerAsks(){
  if(!intvState) return;
  var q = intvState.questions[intvState.qIdx];
  if(!q){ finishInterview(); return; }
  intvState.phase = 'asking';
  intvState.currentTranscript = '';
  renderInterview();
  var text = getQuestionTextEn(q);
  speakAsOfficer(text, function(){
    if(!intvState || intvState.phase !== 'asking') return;
    intvState.phase = 'ready';
    renderInterview();
    // Hands-free: auto-pop the mic 600ms after officer finishes asking
    if(intvState.handsFree && IntvVoice.recognizer){
      setTimeout(function(){
        if(intvState && intvState.phase === 'ready' && intvState.handsFree){
          startListeningToUser();
        }
      }, 600);
    }
  });
}

function toggleIntvHandsFree(){
  if(!intvState) return;
  intvState.handsFree = !intvState.handsFree;
  if(user){ user.intvHandsFree = intvState.handsFree; saveUser(); }
  renderInterview();
  toast(intvState.handsFree
    ? (lang==='es' ? 'Modo manos libres activado' : 'Hands-free mode on')
    : (lang==='es' ? 'Modo manos libres desactivado' : 'Hands-free mode off'), intvState.handsFree ? 'mic' : null);
  // If we just turned it on and we're at the ready phase, kick off listening
  if(intvState.handsFree && intvState.phase === 'ready' && IntvVoice.recognizer){
    setTimeout(startListeningToUser, 250);
  }
}

function replayOfficer(){
  if(!intvState) return;
  var q = intvState.questions[intvState.qIdx];
  speakAsOfficer(getQuestionTextEn(q));
}

function userPressMic(){
  // NOT async. We need to call start() synchronously to preserve iOS user gesture.
  if(!intvState) return;
  if(intvState.phase === 'listening'){
    stopListening();
    return;
  }
  if(intvState.phase === 'verdict'){
    intvState.phase = 'ready';
    intvState.currentTranscript = '';
    intvState.results.pop();
    renderInterview();
    return;
  }
  // Ensure recognizer is ready (re-init if a prior session destroyed it)
  if(!IntvVoice.recognizer) initIntvVoice();
  if(!IntvVoice.recognizer){
    toast(lang==='es' ? 'Tu navegador no soporta voz. Usa el modo de texto.' : 'Voice not supported. Use text mode.');
    return;
  }
  // Kick off audio stream + recording in parallel (best-effort) but don't await. The
  // SpeechRecognition start() must happen in the same synchronous tick as the click.
  // (Native speech owns the microphone itself; a parallel getUserMedia would fight it.)
  if(!IntvVoice.nativeSpeech) ensureMicPermission().catch(function(){});
  startListeningToUser();
}

function startListeningToUser(){
  if(!intvState) return;
  if(!IntvVoice.recognizer) initIntvVoice();
  if(!IntvVoice.recognizer){
    toast(lang==='es' ? 'Tu navegador no soporta voz' : 'Voice not supported');
    return;
  }
  stopOfficerSpeaking();
  intvState.phase = 'listening';
  intvState.currentTranscript = '';
  intvState.finalAlternatives = [];
  intvState.liveConfidence = 0;
  intvState.lastWasTyped = false;
  intvState.lastAudioUrl = null;
  renderInterview();
  if(!IntvVoice.nativeSpeech){
    startAudioRecording();
    // Kick the audio level meter after a tick so the bars exist in DOM
    setTimeout(startMicLevelMeter, 100);
  }

  // Always use a fresh recognizer to avoid stale-state bugs after multiple Qs
  var SR = speechRecognitionCtor();
  try { if(IntvVoice.recognizer) IntvVoice.recognizer.abort(); } catch(e){}
  var rec = new SR();
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 5;
  // USCIS interview is in English; the officer expects en-US answers.
  rec.lang = 'en-US';
  IntvVoice.recognizer = rec;

  rec.onresult = function(event){
    if(!intvState) return;
    var displayText = '';
    var liveConfs = [];
    var finalAlts = [];   // collected final-result alternatives [{transcript, confidence}, ...]
    for(var i=0;i<event.results.length;i++){
      var r = event.results[i];
      displayText += r[0].transcript + ' ';
      if(typeof r[0].confidence === 'number' && r[0].confidence > 0) liveConfs.push(r[0].confidence);
      if(r.isFinal){
        for(var j=0;j<r.length;j++){
          finalAlts.push({ transcript: r[j].transcript, confidence: r[j].confidence || 0 });
        }
      }
    }
    intvState.currentTranscript = displayText.trim();
    intvState.finalAlternatives = finalAlts;
    intvState.liveConfidence = liveConfs.length ? liveConfs.reduce(function(a,b){return a+b;},0)/liveConfs.length : 0;

    var live = document.getElementById('intvLiveTranscript');
    if(live) live.textContent = intvState.currentTranscript || (lang==='es'?'Escuchando…':'Listening…');
    var dot = document.getElementById('intvConfDot');
    if(dot){
      var c = intvState.liveConfidence;
      dot.style.background = c === 0 ? '#84807a' : c >= 0.7 ? '#34c759' : c >= 0.4 ? '#ffc83d' : '#ff4d3a';
    }
  };
  rec.onerror = function(event){
    if(!intvState) return;
    var err = (event && event.error) || 'unknown';
    if(err === 'not-allowed' || err === 'service-not-allowed'){
      user.micPermission = 'denied';
      saveUser();
      toast(Store.isNative()
        ? (lang==='es' ? 'Micrófono o voz bloqueados. Actívalos en Ajustes › Camino' : 'Microphone or speech access is off. Turn it on in Settings › Camino')
        : (lang==='es' ? 'Permiso del micrófono bloqueado. Actívalo en el navegador' : 'Mic blocked. Enable it in browser settings'));
    } else if(err === 'no-speech'){
      toast(lang==='es' ? 'No te oí. Toca el micrófono y habla' : "I didn't hear you. Tap mic and speak");
    } else if(err === 'audio-capture'){
      toast(lang==='es' ? 'No se encontró micrófono' : 'No microphone found');
    } else if(err === 'network'){
      toast(lang==='es' ? 'Error de red al reconocer voz' : 'Network error during recognition');
    } else if(err === 'aborted'){
      // silent. User pressed stop
    } else {
      toast(lang==='es' ? 'Error de voz: '+err : 'Voice error: '+err);
    }
    if(intvState && intvState.phase === 'listening'){
      intvState.phase = 'ready';
      renderInterview();
    }
  };
  rec.onend = function(){
    if(!intvState) return;
    stopAudioRecording();
    if(intvState.phase === 'listening'){
      setTimeout(function(){ processIntvAnswer(); }, 120);
    }
  };
  try { rec.start(); }
  catch(e){
    try { rec.abort(); } catch(e2){}
    setTimeout(function(){
      try { rec.start(); } catch(e3){
        if(intvState){
          intvState.phase = 'ready';
          renderInterview();
        }
        toast(lang==='es' ? 'No se pudo iniciar la voz' : 'Could not start voice. Try again');
      }
    }, 200);
  }
}

function submitFallbackAnswer(){
  if(!intvState) return;
  var inp = document.getElementById('intvFallbackInput');
  if(!inp) return;
  var v = (inp.value || '').trim();
  if(!v){ toast(lang==='es' ? 'Escribe una respuesta primero' : 'Type an answer first'); try { inp.focus(); } catch(e){} return; }
  intvState.currentTranscript = v;
  intvState.finalAlternatives = [];
  intvState.liveConfidence = 1;           // typed = we know exactly what they said
  intvState.lastWasTyped = true;
  processIntvAnswer();
}
// "Try again" from the didn't-catch-that screen: voice if we have it, else back to typing.
function retryIntvAnswer(){
  if(!intvState) return;
  if(IntvVoice.recognizer) return userPressMic();
  intvState.phase = 'ready';
  intvState.currentTranscript = '';
  renderInterview();
}

// Detect short, command-shaped utterances ("skip", "repeat", "stop"). Only fires
// when the entire transcript IS the command (give or take a filler word), so a
// real civics answer that happens to contain "stop" or "next" can't trigger it.
function detectVoiceCommand(transcript){
  if(!transcript) return null;
  var t = String(transcript).toLowerCase().trim();
  if(t.length > 28) return null;
  // Strip benign fillers + punctuation to get the command core
  var s = t.replace(/\b(please|now|hey|um|uh|ok|okay|sir|ma'?am|cami|officer)\b/g, '')
           .replace(/[^\w\s'-]/g, '')
           .replace(/\s+/g,' ').trim();
  if(!s) return null;
  if(/^(skip|skip it|skip this|skip ahead|next|next one|next question|pass|move on)$/.test(s)) return 'next';
  if(/^(repeat|repeat it|repeat that|say again|say it again|come again|once more|what)$/.test(s)) return 'repeat';
  if(/^(stop|pause|exit|end interview|im done|i am done|that(s| is) enough)$/.test(s)) return 'stop';
  return null;
}

// User chose "Grade anyway" from the low-confidence screen → bypass the retry path.
function forceGradeIntvAnswer(){
  if(!intvState) return;
  intvState.lowConfHeard = null;
  intvState._forceGrade = true;
  processIntvAnswer();
}

function processIntvAnswer(){
  if(!intvState) return;
  var transcript = (intvState.currentTranscript || '').trim();

  // Voice command intercept. Only when hands-free is on (avoids false positives
  // when someone genuinely says "stop" or "next" as part of a real civics answer).
  if(intvState.handsFree && !intvState._forceGrade){
    var cmd = detectVoiceCommand(transcript);
    if(cmd){
      if(cmd === 'next'){
        toast(lang==='es' ? 'Saltando…' : 'Skipping…');
        return skipInterviewQ();
      }
      if(cmd === 'repeat'){
        toast(lang==='es' ? 'Repitiendo pregunta…' : 'Repeating question…', 'refresh');
        intvState.phase = 'asking';
        intvState.currentTranscript = '';
        renderInterview();
        setTimeout(officerAsks, 300);
        return;
      }
      if(cmd === 'stop'){
        toast(lang==='es' ? 'Saliendo de la entrevista' : 'Exiting interview');
        return exitInterview();
      }
    }
  }

  var q = intvState.questions[intvState.qIdx];
  var variants = getAcceptedVariants(q);

  // Pull together every transcript the recognizer ever gave us. The main one PLUS
  // the up-to-5 alternatives from each final result. Score them all; pick the best.
  // Web Speech's top alternative is often a less-good match than its #2/3/4.
  var candidates = [];
  if(transcript) candidates.push({ transcript: transcript, confidence: intvState.liveConfidence || 0.7 });
  if(intvState.finalAlternatives && intvState.finalAlternatives.length){
    intvState.finalAlternatives.forEach(function(alt){
      if(alt.transcript && alt.transcript.trim()) candidates.push(alt);
    });
  }

  var best = { verdict: 'wrong', score: 0, matched: variants[0], heard: transcript, confidence: 0 };
  for(var c=0;c<candidates.length;c++){
    var cand = candidates[c];
    var r = evaluateIntvAnswer(cand.transcript, variants);
    if(r.score > best.score){
      best = r;
      best.heard = cand.transcript;
      best.confidence = cand.confidence || 0;
    }
  }
  var result = best;

  // Smart-retry: very-low recognizer confidence + nothing matched → don't punish.
  // Surface a "Didn't catch that. Try again?" path instead of marking wrong.
  // User can override via forceGradeIntvAnswer() ("Grade anyway") to skip this gate.
  if(!intvState._forceGrade && !intvState.lastWasTyped
     && result.verdict === 'wrong' && result.score < 0.15
     && (result.confidence || 0) < 0.5 && transcript.length < 40){
    intvState.phase = 'lowConfidence';
    intvState.lowConfHeard = transcript;
    renderInterview();
    return;
  }
  intvState.lowConfHeard = null;
  intvState._forceGrade = false;

  intvState.results.push({
    qIdx: intvState.qIdx,
    type: q.type,
    qId: q.qId,           // civics question id for mastery tracking
    questionText: getQuestionTextEn(q),
    questionTextLocal: getQuestionTextLocal(q),
    verdict: result.verdict,
    heard: transcript,
    matched: result.matched,
    expected: variants[0],
    score: result.score,
    confidence: result.confidence || 0,
    topMatches: result.topMatches || [],
    overridden: false,
    audioUrl: intvState.lastAudioUrl || null
  });
  intvState.lastAudioUrl = null;
  // Track mastery for civics questions only
  if(q.type === 'civics' && q.qId){
    updateCivicsMastery(q.qId, result.verdict);
    saveUser();
  }
  // Session streak
  if(result.verdict === 'correct'){
    intvState.currentStreak = (intvState.currentStreak || 0) + 1;
    if(intvState.currentStreak > (intvState.bestStreak || 0)) intvState.bestStreak = intvState.currentStreak;
    intvState.justIncrementedStreak = true;
  } else {
    intvState.currentStreak = 0;
    intvState.justIncrementedStreak = false;
  }
  if(result.verdict === 'correct') sfxCorrect();
  else if(result.verdict === 'close') sfxClose();
  else sfxWrong();
  intvState.phase = 'verdict';
  renderInterview();
  // Officer responds
  setTimeout(function(){
    speakOfficerFeedback(result.verdict, variants[0], function(){
      // Hands-free: auto-advance after the officer's verdict speech finishes
      if(intvState && intvState.handsFree && intvState.phase === 'verdict'){
        if(intvState.autoAdvanceTimer) clearTimeout(intvState.autoAdvanceTimer);
        intvState.autoAdvanceTimer = setTimeout(function(){
          if(intvState && intvState.handsFree && intvState.phase === 'verdict') nextInterviewQ();
        }, 1400);
      }
    });
  }, 350);
}

// Speaks the verdict. For close/wrong verdicts the line is "<stem> <expected>",
// where expected can be a fixed civics answer (has a clip). Play stem clip +
// answer clip back-to-back. User-specific N-400 answers have no clip, so the
// whole composed line falls back to speechSynthesis.
function speakOfficerFeedback(verdict, expected, onEnd){
  if(verdict !== 'correct'){
    var stem = (verdict === 'close') ? 'Close enough. The expected answer is:' : 'The correct answer is:';
    var stemUrl = clipUrlFor('en', stem);
    var ansUrl = clipUrlFor('en', expected);
    if(stemUrl && ansUrl){
      playVoiceClipSequence([stemUrl, ansUrl], null, onEnd,
        function(){ speakOfficerLegacy(officerFeedbackText(verdict, expected), null, onEnd); });
      return;
    }
  }
  speakAsOfficer(officerFeedbackText(verdict, expected), onEnd);
}

function officerFeedbackText(verdict, expected){
  var encouragements = ['Correct.','Good.',"That's right.",'Yes.','Excellent.','Right.'];
  if(verdict === 'correct') return encouragements[Math.floor(Math.random()*encouragements.length)];
  if(verdict === 'close') return "Close enough. The expected answer is: " + expected;
  return "The correct answer is: " + expected;
}

function overrideAsCorrect(){
  if(!intvState || !intvState.results.length) return;
  var r = intvState.results[intvState.results.length - 1];
  r.verdict = 'correct';
  r.overridden = true;
  // Override updates mastery. STT misheard the user, the answer was right
  if(r.type === 'civics' && r.qId){
    updateCivicsMastery(r.qId, 'correct');
    saveUser();
  }
  renderInterview();
  toast(lang==='es' ? 'Marcado como correcto' : 'Marked correct');
}

// "Did you mean?" tap-to-accept. Bumps verdict to correct with the chosen variant noted.
function acceptDidYouMean(idx){
  if(!intvState || !intvState.results.length) return;
  var r = intvState.results[intvState.results.length - 1];
  if(!r.topMatches || !r.topMatches[idx]) return;
  r.matched = r.topMatches[idx];
  r.verdict = 'correct';
  r.overridden = true;
  if(r.type === 'civics' && r.qId){
    updateCivicsMastery(r.qId, 'correct');
    saveUser();
  }
  renderInterview();
  toast(lang==='es' ? 'Aceptado como correcto' : 'Accepted as correct');
}

function nextInterviewQ(){
  if(!intvState) return;
  stopOfficerSpeaking();
  if(intvState.qIdx >= intvState.questions.length - 1){
    return finishInterview();
  }
  intvState.qIdx++;
  intvState.phase = 'asking';
  intvState.currentTranscript = '';
  renderInterview();
  setTimeout(function(){ officerAsks(); }, 400);
}

function skipInterviewQ(){
  if(!intvState) return;
  var q = intvState.questions[intvState.qIdx];
  var variants = getAcceptedVariants(q);
  intvState.results.push({
    qIdx: intvState.qIdx,
    type: q.type,
    questionText: getQuestionTextEn(q),
    questionTextLocal: getQuestionTextLocal(q),
    verdict: 'wrong',
    heard: '',
    matched: null,
    expected: variants[0],
    score: 0,
    overridden: false,
    skipped: true
  });
  nextInterviewQ();
}

function finishInterview(){
  if(!intvState) return;
  stopOfficerSpeaking();
  stopListening();
  var r = intvState.results;
  var correct = r.filter(function(x){return x.verdict==='correct';}).length;
  var close = r.filter(function(x){return x.verdict==='close';}).length;
  var wrong = r.filter(function(x){return x.verdict==='wrong';}).length;
  var total = r.length;
  // Pass mark follows the real civics test for the user's version (12/20 or
  // 6/10 = 60%), judged on the civics questions only. N-400 answers are
  // practice, not points.
  var rules = currentTestRules();
  var civ = r.filter(function(x){ return x.type === 'civics'; });
  var civicsCorrect = civ.filter(function(x){ return x.verdict === 'correct'; }).length;
  var civicsTotal = civ.length;
  var passed = civicsTotal > 0 && (civicsCorrect / civicsTotal) >= (rules.mockPass / rules.mockSize);
  var score = total > 0 ? Math.round((correct + close * 0.5) / total * 100) : 0;
  if(!user.progress.interviewAttempts) user.progress.interviewAttempts = [];
  markActiveToday();
  syncMasteredCount();
  user.progress.interviewAttempts.push({
    score: score, correct: correct, close: close, wrong: wrong, total: total,
    civicsCorrect: civicsCorrect, civicsTotal: civicsTotal, version: currentTestVersion(),
    passed: passed, takenAt: todayISO()
  });
  if(user.progress.interviewAttempts.length > 50) user.progress.interviewAttempts = user.progress.interviewAttempts.slice(-50);
  saveUser();
  if(passed) sfxComplete(); else sfxFail();
  intvState.phase = 'done';
  renderInterview();
}

// Cami's head in an officer's peaked cap. The "USCIS officer" avatar in the interview sim.
function camiOfficerSVG(size){
  size = size || 40;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<circle cx="50" cy="61" r="25" fill="#ffffff" stroke="#1d1d22" stroke-width="3"/>'
    + '<circle cx="62" cy="57" r="3.4" fill="#1d1d22"/>'
    + '<circle cx="63.3" cy="55.8" r="1.1" fill="#ffffff"/>'
    + '<polygon points="74,59 90,56 74,67" fill="#ff9b21" stroke="#1d1d22" stroke-width="2" stroke-linejoin="round"/>'
    + '<rect x="24" y="37" width="52" height="8" rx="1.5" fill="#16294a" stroke="#1d1d22" stroke-width="2"/>'
    + '<path d="M25 39 Q25 19 50 19 Q75 19 75 39 Z" fill="#3a5a99" stroke="#1d1d22" stroke-width="2.5" stroke-linejoin="round"/>'
    + '<path d="M50 25 L55 27.4 V32 Q55 36 50 37.6 Q45 36 45 32 V27.4 Z" fill="#ffc83d" stroke="#1d1d22" stroke-width="1.2" stroke-linejoin="round"/>'
    + '<path d="M40 45 Q58 40 78 47 Q60 52 40 47 Z" fill="#0e1830" stroke="#1d1d22" stroke-width="2" stroke-linejoin="round"/>'
    + '</svg>';
}

function renderInterview(){
  if(!intvState) return;
  var counter = document.getElementById('intvCounter');
  var fill = document.getElementById('intvProgressFill');
  var body = document.getElementById('intvBody');
  var footer = document.getElementById('intvFooter');
  if(!body) return;

  if(intvState.phase === 'done'){
    renderInterviewResults();
    return;
  }

  var q = intvState.questions[intvState.qIdx];
  if(!q){ finishInterview(); return; }

  if(counter) counter.textContent = (intvState.qIdx+1) + ' / ' + intvState.questions.length;
  if(fill){
    var prog = intvState.qIdx + (intvState.phase==='verdict'?1:intvState.phase==='listening'?0.6:intvState.phase==='ready'?0.3:0);
    fill.style.width = (prog / intvState.questions.length * 100) + '%';
  }

  var questionText = getQuestionTextLocal(q);
  var questionEn = getQuestionTextEn(q);
  var typeIcon = inlineIcon(q.type === 'civics' ? 'book' : (q.n400Q.icon || 'id'), q.type === 'civics' ? '#1cb0f6' : '#8c4dd1', 14);
  var typeLbl = (q.type === 'civics') ? (lang==='es'?'Cívica':'Civics') : (lang==='es'?'N-400':'N-400');

  var hfActive = !!intvState.handsFree;
  if(!IntvVoice.recognizer) hfActive = false;
  var hfBtn = !IntvVoice.recognizer ? '' : '<button class="intvHandsFreeBtn'+(hfActive?' intvHandsFreeOn':'')+'" '
    + 'onclick="toggleIntvHandsFree()" '
    + 'aria-pressed="'+(hfActive?'true':'false')+'" '
    + 'aria-label="'+(lang==='es'?'Modo manos libres':'Hands-free mode')+'" '
    + 'title="'+(lang==='es'?'Manos libres':'Hands-free')+'">'
    + iconSVG('mic', hfActive?'#fff':'#84807a', 14)
    + '<span class="intvHandsFreeLbl">'+(lang==='es'?'Manos libres':'Hands-free')+'</span>'
    + '</button>';
  // Session streak badge. Pulses on increment
  var streak = intvState.currentStreak || 0;
  var streakBadge = streak >= 2
    ? '<div class="intvStreakBadge'+(intvState.justIncrementedStreak?' intvStreakPulse':'')+'" title="'+(lang==='es'?'Racha de respuestas':'Answer streak')+'">'
        + iconSVG('flame','#ff4d3a',14) + '<span class="intvStreakN">'+streak+'</span>'
        + '<span class="intvStreakRow">'+(lang==='es'?'al hilo':'in a row')+'</span>'
      + '</div>'
    : '';
  // Clear the pulse flag after one render so it only animates the moment it increments
  intvState.justIncrementedStreak = false;
  var html = ''
    + '<div class="intvOfficerRow">'
    +   '<div class="intvOfficerAvatar">'+camiOfficerSVG(40)+'</div>'
    +   '<div class="intvOfficerHeadCol"><div class="intvOfficerLabel">'+(lang==='es'?'OFICIAL DE USCIS':'USCIS OFFICER')+'</div>'
    +   '<div class="intvOfficerSub">'+typeIcon+typeLbl+(q.type==='civics'?' · '+(lang==='es'?'pregunta '+q.qId:'question '+q.qId):'')+'</div></div>'
    +   streakBadge
    +   hfBtn
    + '</div>'
    + '<div class="intvBubble">'+questionText+'</div>';
  if(lang !== 'en') html += '<div class="intvBubbleEn">"'+questionEn+'"</div>';
  if(ttsSupported()){
    html += '<button class="intvReplayBtn" onclick="replayOfficer()">'+inlineIcon('speaker','#1cb0f6')+(lang==='es'?'Escuchar de nuevo':'Hear it again')+'</button>';
  }

  // Phase-specific content
  if(intvState.phase === 'asking'){
    html += '<div class="intvStatusRow"><span class="intvDots"><span></span><span></span><span></span></span>'
      + (lang==='es' ? 'El oficial te está hablando…' : 'Officer is speaking…')
      + '</div>';
  } else if(intvState.phase === 'ready'){
    var hasMic = !!IntvVoice.recognizer;
    if(hasMic){
      html += '<div class="intvMicArea">'
        + '<button class="intvMicBtn" onclick="userPressMic()">'
        +   '<div class="intvMicIco">'+iconSVG('mic','#fff',38)+'</div>'
        + '</button>'
        + '<div class="intvMicHint">'+(lang==='es'?'Toca y responde en voz alta':'Tap, then answer out loud')+'</div>'
        + '</div>';
    }
    // Typing is always available (listing: "answer by voice or by typing").
    html += '<div class="intvFallback'+(hasMic?' intvFallbackSecondary':'')+'">'
      + '<div class="intvFallbackLbl">'+(hasMic ? (lang==='es'?'O escribe tu respuesta:':'Or type your answer:') : (lang==='es'?'Escribe tu respuesta:':'Type your answer:'))+'</div>'
      + '<input type="text" id="intvFallbackInput" class="intvFallbackInput" placeholder="'+(lang==='es'?'Tu respuesta…':'Your answer…')+'" autocomplete="off" autocapitalize="sentences" '+(hasMic?'':'autofocus ')+'onkeydown="if(event.key===\'Enter\'){event.preventDefault();submitFallbackAnswer();}" />'
      + '<button class="cta" onclick="submitFallbackAnswer()">'+(lang==='es'?'Enviar':'Submit')+'</button>'
      + '</div>';
  } else if(intvState.phase === 'listening'){
    html += '<div class="intvMicArea">'
      + '<button class="intvMicBtn intvMicActive" onclick="userPressMic()">'
      +   '<div class="intvMicIco">'+iconSVG('mic','#fff',38)+'</div>'
      +   '<div class="intvMicPulse"></div>'
      + '</button>'
      + '<div class="intvMicLevel" aria-hidden="true">'
      +   '<div class="intvMicLevelBar"></div><div class="intvMicLevelBar"></div><div class="intvMicLevelBar"></div><div class="intvMicLevelBar"></div><div class="intvMicLevelBar"></div>'
      + '</div>'
      + '<div class="intvMicHint intvMicHintActive">'+(lang==='es'?'Escuchando… toca para parar':'Listening… tap to stop')+'</div>'
      + '<div class="intvLiveBox">'
      +   '<div class="intvLiveLbl"><span id="intvConfDot" class="intvConfDot" title="Recognition confidence"></span>'+(lang==='es'?'TE OIGO':'I HEAR YOU')+'</div>'
      +   '<div class="intvLiveTranscript" id="intvLiveTranscript">'+(intvState.currentTranscript || (lang==='es'?'…':'…'))+'</div>'
      +   '<div class="intvPacingHint" id="intvPacingHint"></div>'
      + '</div>'
      + '</div>';
  } else if(intvState.phase === 'lowConfidence'){
    html += '<div class="intvLowConf">'
      + '<div class="intvLowConfIco">'+iconSVG('question','#84807a',32)+'</div>'
      + '<div class="intvLowConfTitle">'+(lang==='es'?"No te oí bien":"I didn't catch that")+'</div>'
      + (intvState.lowConfHeard
          ? '<div class="intvLowConfHeard">'+(lang==='es'?'Te oí: ':'I heard: ')+'"<em>'+esc(intvState.lowConfHeard)+'</em>"</div>'
          : '<div class="intvLowConfHeard">'+(lang==='es'?'No oí nada. Habla más cerca del micrófono':'I heard silence. Speak closer to the mic')+'</div>')
      + '<div class="intvLowConfRow">'
      +   '<button class="cta intvLowConfRetry" onclick="retryIntvAnswer()">'+(IntvVoice.recognizer ? iconSVG('mic','#fff',16)+' ' : '')+(lang==='es'?'Reintentar':'Try again')+'</button>'
      +   '<button class="intvLowConfShow" onclick="forceGradeIntvAnswer()">'+(lang==='es'?'Calificar de todos modos':'Grade anyway')+'</button>'
      + '</div>'
      + '</div>';
  } else if(intvState.phase === 'verdict'){
    var last = intvState.results[intvState.results.length - 1];
    var verdictClass = last.verdict;
    var verdictLbl, verdictIco;
    if(last.verdict === 'correct'){
      verdictLbl = last.overridden ? (lang==='es'?'✓ Marcado correcto':'✓ Marked correct') : (lang==='es'?'✓ Correcto':'✓ Correct');
      verdictIco = '✓';
    } else if(last.verdict === 'close'){
      verdictLbl = lang==='es' ? '△ Cerca' : '△ Close';
      verdictIco = '△';
    } else {
      verdictLbl = lang==='es' ? '✗ No del todo' : '✗ Not quite';
      verdictIco = '✗';
    }
    var playBtn = last.audioUrl
      ? '<button class="intvPlayBtn" onclick="playUserAudio(\''+last.audioUrl+'\')">▶ '+(lang==='es'?'Escucharme':'Play my answer')+'</button>'
      : '';
    // "Did you mean?". Show top distinct variants the user can tap if they had a near miss.
    // Only meaningful when not already 'correct' AND we have candidates with non-zero score.
    var didYouMeanHtml = '';
    if(last.verdict !== 'correct' && last.topMatches && last.topMatches.length){
      var pillsHtml = '';
      for(var dym=0; dym<last.topMatches.length; dym++){
        pillsHtml += '<button class="intvDymPill" onclick="acceptDidYouMean('+dym+')">'
          + iconSVG('check','#00b4a8',12) + ' ' + last.topMatches[dym] + '</button>';
      }
      didYouMeanHtml = '<div class="intvDym">'
        + '<div class="intvDymLbl">'+(lang==='es'?'¿Quisiste decir?':'Did you mean?')+'</div>'
        + '<div class="intvDymPills">'+pillsHtml+'</div>'
        + '</div>';
    }
    var hearBtn = ttsSupported()
      ? '<button class="intvHearItBtn" onclick="hearOfficialAnswer()" aria-label="'+(lang==='es'?'Escuchar respuesta correcta':'Hear the correct answer')+'">'
        + iconSVG('speaker','#fff',14)
        + ' ' + (lang==='es'?'Escuchar bien dicho':'Hear it spoken')
        + '</button>'
      : '';
    html += '<div class="intvVerdict intvVerdict-'+verdictClass+'">'
      + '<div class="intvVerdictHead">'+verdictLbl+'</div>'
      + '<div class="intvVerdictRow"><div class="intvVerdictKey">'+(lang==='es'?'TE OÍ':'I HEARD')+'</div><div class="intvVerdictVal">"'+(last.heard || '–')+'"</div></div>'
      + playBtn
      + '<div class="intvVerdictRow"><div class="intvVerdictKey">'+(lang==='es'?'RESPUESTA OFICIAL':'OFFICIAL ANSWER')+'</div><div class="intvVerdictVal intvVerdictExpected">'+last.expected+'</div></div>'
      + hearBtn
      + (last.matched && last.matched !== last.expected ? '<div class="intvVerdictRow"><div class="intvVerdictKey">'+(lang==='es'?'COINCIDIÓ CON':'MATCHED')+'</div><div class="intvVerdictVal">'+last.matched+'</div></div>' : '')
      + didYouMeanHtml
      + (last.verdict !== 'correct' ? '<button class="intvOverrideBtn" onclick="overrideAsCorrect()">'+(lang==='es'?'Realmente lo dije bien. Marcar como correcto':'I said it right. Mark correct')+'</button>' : '')
      + '</div>';
  }
  body.innerHTML = html;
  populateIcons();

  if(footer){
    var f = '';
    if(intvState.phase === 'ready' || intvState.phase === 'asking'){
      f = '<button class="intvSkipBtn" onclick="skipInterviewQ()">'+(lang==='es'?'Saltar':'Skip')+'</button>';
    } else if(intvState.phase === 'listening'){
      f = '<button class="intvSkipBtn" onclick="userPressMic()">'+(lang==='es'?'Detener':'Stop')+'</button>';
    } else if(intvState.phase === 'lowConfidence'){
      f = '<button class="intvSkipBtn" onclick="skipInterviewQ()">'+(lang==='es'?'Saltar pregunta':'Skip question')+'</button>';
    } else if(intvState.phase === 'verdict'){
      var isLast = intvState.qIdx >= intvState.questions.length - 1;
      f = '<button class="cta intvShowBtn" onclick="nextInterviewQ()">'+(isLast ? (lang==='es'?'Ver mi resultado':'See my result') : (lang==='es'?'Siguiente pregunta':'Next question'))+' →</button>';
    }
    footer.innerHTML = f;
  }
}

function renderInterviewResults(){
  if(!intvState) return;
  var r = intvState.results;
  var correct = r.filter(function(x){return x.verdict==='correct';}).length;
  var close = r.filter(function(x){return x.verdict==='close';}).length;
  var wrong = r.filter(function(x){return x.verdict==='wrong';}).length;
  var total = r.length;
  var passed = total > 0 && correct >= Math.ceil(total * 0.6);

  var counter = document.getElementById('intvCounter');
  if(counter) counter.textContent = lang==='es' ? 'Resultado' : 'Result';
  var fill = document.getElementById('intvProgressFill');
  if(fill) fill.style.width = '100%';

  var body = document.getElementById('intvBody');
  var footer = document.getElementById('intvFooter');
  if(!body) return;

  var verdictTxt = passed
    ? (lang==='es' ? '¡Pasarías la entrevista!' : 'You would pass!')
    : (lang==='es' ? 'Más práctica recomendada' : 'More practice needed');
  var rules = currentTestRules();
  var civ = r.filter(function(x){ return x.type === 'civics'; });
  var civicsCorrect = civ.filter(function(x){ return x.verdict === 'correct'; }).length;
  var verdictSub = passed
    ? (lang==='es' ? 'Cívica: '+civicsCorrect+'/'+civ.length+' correctas. USCIS exige '+rules.mockPass+' de '+rules.mockSize+' ('+Math.round(rules.mockPass/rules.mockSize*100)+'%).' : 'Civics: '+civicsCorrect+'/'+civ.length+' correct. USCIS requires '+rules.mockPass+' of '+rules.mockSize+' ('+Math.round(rules.mockPass/rules.mockSize*100)+'%).')
    : (lang==='es' ? 'Cívica: '+civicsCorrect+'/'+civ.length+' correctas. Practica los temas marcados abajo.' : 'Civics: '+civicsCorrect+'/'+civ.length+' correct. Practice the topics flagged below.');

  // Per-question breakdown with audio playback if recorded
  var breakHtml = '';
  for(var i=0;i<r.length;i++){
    var x = r[i];
    var ico = x.verdict==='correct' ? '✓' : x.verdict==='close' ? '△' : '✗';
    var cls = 'intvBVRow-' + x.verdict;
    var playBtnRow = x.audioUrl
      ? '<button class="intvBVPlay" onclick="playUserAudio(\''+x.audioUrl+'\')">▶ '+(lang==='es'?'Oír':'Play')+'</button>'
      : '';
    breakHtml += '<div class="intvBVRow '+cls+'">'
      + '<div class="intvBVIco">'+ico+'</div>'
      + '<div class="intvBVMain">'
      +   '<div class="intvBVQ">'+(x.questionTextLocal || x.questionText)+'</div>'
      +   '<div class="intvBVA"><strong>'+(lang==='es'?'Tú:':'You:')+'</strong> '+(x.heard ? '"'+esc(x.heard)+'"' : (lang==='es'?'(saltada)':'(skipped)'))+' '+playBtnRow+'</div>'
      +   (x.verdict !== 'correct' ? '<div class="intvBVA"><strong>'+(lang==='es'?'Oficial:':'Officer:')+'</strong> '+x.expected+'</div>' : '')
      + '</div>'
      + '</div>';
  }

  // Topic heatmap. Per-civics-unit mastery from your overall study, not just this session
  var heatmap = civicsUnitMastery();
  var heatmapHtml = '';
  if(heatmap.length){
    heatmap.forEach(function(u){
      var pct = u.total > 0 ? Math.round((u.mastered / u.total) * 100) : 0;
      var tone = pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low';
      var weakBadge = u.weak > 0
        ? '<span class="intvHeatWeak">'+u.weak+' '+(lang==='es'?'débil'+(u.weak===1?'':'es'):'weak')+'</span>'
        : '';
      var actionBtn = u.weakestLesson
        ? '<button class="intvHeatLessonBtn" onclick="startLesson(\''+u.weakestLesson+'\')">'+(lang==='es'?'Estudiar →':'Study →')+'</button>'
        : '';
      heatmapHtml += '<div class="intvHeatRow">'
        + '<div class="intvHeatLeft">'
        +   '<div class="intvHeatTitle">'+u.unit.title[lang]+'</div>'
        +   '<div class="intvHeatStats">'+u.mastered+'/'+u.total+' '+(lang==='es'?'dominadas':'mastered')+' · '+pct+'% '+weakBadge+'</div>'
        +   '<div class="intvHeatBar"><div class="intvHeatFill intvHeatFill-'+tone+'" style="width:'+pct+'%"></div></div>'
        + '</div>'
        + actionBtn
        + '</div>';
    });
    heatmapHtml = '<div class="intvBVTitle">'+(lang==='es'?'Tu dominio por tema':'Your mastery by topic')+'</div>'
      + '<div class="intvHeatmap">'+heatmapHtml+'</div>';
  }

  var needWork = civicsNeedsWorkCount();
  var hint = needWork > 0
    ? '<div class="intvNextHint">'+inlineIcon('target','#ff9b21')+needWork+' '+(lang==='es'?'preguntas necesitan trabajo · la próxima sesión las prioriza':'questions need work · next session prioritizes them')+'</div>'
    : '';

  body.innerHTML = ''
    + '<div class="intvResultsHead">'
    +   '<div class="intvResultBadge '+(passed?'intvGood':'intvWeak')+'">'+verdictTxt+'</div>'
    +   '<div class="intvScoreNum">'+correct+'/'+total+'</div>'
    +   '<div class="intvScoreSub">'+verdictSub+'</div>'
    + '</div>'
    + '<div class="intvBreakdown">'
    +   '<div class="intvBreakRow"><div class="intvBreakDot intvBVGood"></div><div class="intvBreakLbl">'+(lang==='es'?'Correctas':'Correct')+'</div><div class="intvBreakVal">'+correct+'</div></div>'
    +   '<div class="intvBreakRow"><div class="intvBreakDot intvBVMid"></div><div class="intvBreakLbl">'+(lang==='es'?'Cerca':'Close')+'</div><div class="intvBreakVal">'+close+'</div></div>'
    +   '<div class="intvBreakRow"><div class="intvBreakDot intvBVBad"></div><div class="intvBreakLbl">'+(lang==='es'?'Erradas':'Wrong')+'</div><div class="intvBreakVal">'+wrong+'</div></div>'
    + '</div>'
    + heatmapHtml
    + hint
    + '<div class="intvBVTitle">'+(lang==='es'?'Tu desempeño pregunta por pregunta':'Question-by-question breakdown')+'</div>'
    + '<div class="intvBVList">'+breakHtml+'</div>';

  if(footer){
    footer.innerHTML = '<button class="cta" onclick="startInterview()">'+inlineIcon('refresh','#fff',16)+(lang==='es' ? 'Practicar de nuevo' : 'Practice again')+'</button>'
      + '<button class="intvBackBtn" onclick="exitInterview()">'+(lang==='es' ? 'Volver a Hoy' : 'Back to Today')+'</button>';
  }
}
function renderHomeInterviewCard(){
  var el = document.getElementById('homeInterviewCard');
  if(!el) return;
  var attempts = (user.progress && user.progress.interviewAttempts) || [];
  var best = attempts.length > 0 ? Math.max.apply(null, attempts.map(function(a){return a.score;})) : null;
  var needWork = civicsNeedsWorkCount();
  var counts = civicsMasteryCounts();
  var masteredTotal = counts.mastered;

  var titleTxt;
  if(attempts.length === 0){
    titleTxt = lang==='es' ? 'Practica tu entrevista USCIS' : 'Practice your USCIS interview';
  } else if(needWork > 0){
    titleTxt = lang==='es'
      ? 'Trabaja en '+needWork+' débiles'
      : 'Drill your '+needWork+' weak spots';
  } else {
    titleTxt = lang==='es' ? '¡Listo para la entrevista!' : "You're interview-ready!";
  }

  var subTxt;
  if(attempts.length === 0){
    subTxt = (voiceInputAvailable()
      ? (lang==='es' ? 'Responde por voz o escribiendo' : 'Answer by voice or by typing')
      : (lang==='es' ? 'Escribe tus respuestas' : 'Type your answers')) + ' · ' + interviewQuestionCount() + (lang==='es' ? ' preguntas · cívica + N-400' : ' questions · civics + N-400');
  } else if(needWork > 0){
    subTxt = lang==='es'
      ? 'La sesión prioriza tus puntos débiles'
      : 'Session prioritizes the ones you missed';
  } else {
    subTxt = lang==='es' ? 'Sigue practicando para mantener tu dominio' : 'Keep practicing to keep your edge';
  }

  var metaLeft, metaRight;
  if(best != null){
    metaLeft = (lang==='es'?'Mejor: ':'Best: ')+best+'%' + limitHint(todayInterviewsAvailable());
    metaRight = (lang==='es'?'Practicar':'Practice');
  } else {
    metaLeft = '~5 '+(lang==='es'?'min':'min')+' · '+interviewQuestionCount()+' '+(lang==='es'?'preguntas':'questions') + limitHint(todayInterviewsAvailable());
    metaRight = (lang==='es'?'Empezar':'Start');
  }

  el.innerHTML = homeCardHtml({icon:'mic', color:'#1cb0f6',
    kicker: lang==='es' ? 'Simulador de entrevista' : 'Interview simulator',
    title: titleTxt, sub: subTxt,
    progress: best != null ? Math.round(masteredTotal / CIVICS.length * 100) : undefined,
    meta: metaLeft, go: metaRight});
}

