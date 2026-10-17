# Archived: voice interview practice

Removed from the app on 2026-10-17. This folder holds everything needed to bring it back.

## Why it was removed
The security audit found that spoken answers (full name, country of birth, green-card
date, "Have you ever been arrested…") could be processed on Apple's servers: the
speech plugin never requested on-device recognition. That contradicts the app's
"your data never leaves your device" promise. The plan is to rebuild the feature with
the ElevenLabs credits (more officer voices, the full N-400 review, follow-up
questions) and bring it back once those issues are fixed.

## What's in this folder
| File | What it is |
|---|---|
| `interview.js` | The interview code cut from `app.js`, in 8 blocks. Each block's header gives its original line range and the line that came before it. |
| `interview.html` | The `#interview` view and the Home card from `index.html` |
| `interview.css` | The interview styles from `styles.css` |
| `removal.patch` | `git diff` of the removal for `app.js`, `index.html`, `styles.css` and `revenuecat-shim.js` |

Line numbers refer to ios-build commit `2947e37`.

## How to restore

### 1. Web code
While the files haven't changed much, the patch puts everything back in one step:
```bash
git apply -R archive/interview/removal.patch
```
If it no longer applies, paste the blocks from `interview.js`, `interview.html` and
`interview.css` back where their headers say. Then put back the hooks the patch also
removed:
- `todaysSession()`: the weekly "Interview rehearsal" item and its `lastIntv` line
- `renderAll()`: the `renderHomeInterviewCard()` call
- `setLang()`: the line that re-renders an open interview
- The officer-voice stub near `pickOfficerVoice()` (`var IntvVoice = { officerVoice: null }`
  and `isWebSpeechSupported`). The archived block replaces it.
- The `.intvFallbackInput` rule in `styles.css`, which was kept because the English
  drill uses it. Don't duplicate it.

### 2. Native speech plugin
```bash
npm install @capacitor-community/speech-recognition@^7.0.1
```
Add these lines back to `revenuecat-shim.js`:
```js
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
window.CapSpeech = SpeechRecognition;
```
Add both usage strings to `ios/App/App/Info.plist`. Use `plutil`, because PlistBuddy
breaks on the apostrophe:
```bash
plutil -insert NSMicrophoneUsageDescription -string "Camino uses the microphone so you can practice answering interview questions out loud." ios/App/App/Info.plist
plutil -insert NSSpeechRecognitionUsageDescription -string "Camino turns your spoken interview answers into text so it can grade them." ios/App/App/Info.plist
```
Then run `npm run sync`. This plugin has no Swift Package Manager support, so the
iOS project must stay on CocoaPods while it's installed.

### 3. Copy that was changed when the feature was removed
Restore or rewrite these in `app.js`:
- The "Unlimited interview practice" entries in `PLUS_FEATURES` and the trial-offer features
- The FAQ answers ("What does Camino Plus include?", "How do I prepare…", and the
  removed "Why are some questions difficult to pass with voice?")
- The Plus-ended modal ("3 interviews a day") and the trial-start toast
- The onboarding "Practice the interview" row, which is now "Practice reading and writing"
- The elected-officials notes, which now point to flashcards
- The Cami "coming soon" row about voice interview practice

Docs: `STORE_LISTING.md` (description, Plus line, screenshot 4), `APP_REVIEW_NOTES.md`
(permissions, feature list, recording script), `BUILD.md`, `legal/SUPPORT.md`.

## Fix before shipping it again
1. **On-device recognition only.** Patch the plugin (e.g. with patch-package) to set
   `recognitionRequest.requiresOnDeviceRecognition = true` when
   `speechRecognizer.supportsOnDeviceRecognition`, and fall back to typing otherwise.
   Or disclose server processing in the privacy policy and the App Store privacy labels.
2. **Escape the transcript.** The typed or spoken answer (`last.heard`) was put into
   `innerHTML` without `esc()` in one place in `renderInterview()`.
3. **Treat N-400 answers as sensitive.** Arrest history and dates should not end up in
   any network request or log.

## User data that was kept
`boot()` still loads `progress.interviewAttempts`, `voiceInterviewsTodayCount`/`Date`,
`intvHandsFree` and `micPermission`, so users' history is still there when the
feature returns.
