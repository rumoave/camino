# Camino: iOS build (Capacitor)

Camino is a plain web app (`index.html` + `app.js` + `styles.css`) wrapped with
[Capacitor](https://capacitorjs.com/) for the App Store. No bundler; `scripts/build-web.js`
just stages the web files into `www/`, which Capacitor copies into the native iOS project.

## Prerequisites
- **A Mac** (or cloud Mac) with **Xcode** + **CocoaPods**. Required by Apple to build/submit.
- **Node 18+** (to run Capacitor CLI).
- Apple Developer Program membership (you have this).

## One-time setup (on the Mac)
```bash
npm install
npm run build              # stages web files into www/ + bundles revenuecat.js (fails loudly if missing)
npx cap add ios            # generates the native ios/ project (Mac only, needs CocoaPods)
npm run assets             # generates all icon + splash sizes from resources/icon.png & splash.png
npx cap sync ios           # copies web assets + installs native plugins into the ios/ project
npm run open:ios           # opens ios/App/App.xcworkspace in Xcode
```

## One-time after `cap add ios`: microphone permission string
Capacitor's generated Info.plist has NO mic usage description, and iOS blocks
microphone access without one (the interview mic meter + audio recording need it).
From the repo root on the Mac:
```bash
/usr/libexec/PlistBuddy -c "Add :NSMicrophoneUsageDescription string Camino uses the microphone so you can practice answering interview questions out loud." ios/App/App/Info.plist
```
Note: remote Macs (MacinCloud) have no mic device, so the simulator will always
show "mic blocked" there. That's environmental. Test voice input on a real iPhone.

## In Xcode
1. Select the **App** target → **Signing & Capabilities** → set your Team (Apple Developer account).
   The bundle identifier is `com.rumoave.camino` (change in `capacitor.config.json` if needed).
2. Add capabilities as features land:
   - **In-App Purchase** (for Camino Plus / RevenueCat).
   - **Sign in with Apple** (only if/when accounts are added).
3. Pick a device/simulator and **Run** to smoke-test.
4. **Product → Archive** → **Distribute App** → App Store Connect to submit.

## Everyday loop after changing web code
```bash
npm run sync    # full build + cap sync ios  (then re-run in Xcode)
```

## N-400 PDF asset (organizer's "generate official draft")
- `n400-official.pdf` is the official USCIS N-400 (public domain), **edition 01/20/25**,
  with the XFA layer stripped (pikepdf) so the AcroForm fields fill everywhere.
- `pdflib.js` is the vendored pdf-lib UMD build (MIT) that fills it on-device.
- **When USCIS ships a new edition:** re-download from uscis.gov/n-400, strip XFA
  (`pikepdf`: delete `Root.AcroForm.XFA`, set `NeedAppearances`), and RE-VERIFY the
  field mapping in `n400FH_buildPdf()` visually. Field names/checkbox indices are
  XFA-generated and scrambled (e.g. marital idx: divorced=0, single=1, widowed=2,
  married=3, annulled=4, separated=5). Judgment fields (Part 1 basis, Part 9
  questions, eye/hair) are intentionally never filled.

## Notes
- `www/` and the generated `ios/` are gitignored (rebuilt from source).
- `config.local.js` (dev Anthropic key) and `sw.js` (service worker) are intentionally
  excluded from the bundle. Cami is disabled in v1 and service workers aren't used natively.
- Icon/splash sources live in `resources/` (`icon.png` 1024², `splash.png` 2732²).
  Re-render them from `resources/icon.html` / `splash.html` if you change the art.

## In-App Purchases (RevenueCat): already wired in code
The purchase layer is built in `app.js` (`Store` + `STORE_CONFIG`). The web build uses a local
mock (so the browser preview works); the native build uses RevenueCat/StoreKit. To go live:

1. **App Store Connect** → create the auto-renewable subscriptions with a **7-day free intro offer**:
   `camino_plus_annual`, `camino_plus_monthly` (or edit the IDs in `STORE_CONFIG`).
2. **RevenueCat** → create the project, add an entitlement `plus`, attach both products, copy the
   **iOS public SDK key** into `STORE_CONFIG.revenueCatApiKey` in `app.js`.
3. The SDK is an ES module and this app has no bundler, so it's exposed via a shim:
   `revenuecat-shim.js` → bundled to `www/revenuecat.js` by `npm run build:rc` (esbuild). `index.html`
   loads it optionally; `Store` also falls back to `Capacitor.Plugins.Purchases`.
4. Run `npm run sync` (builds web + RC shim, then `cap sync`), then test a **sandbox** purchase on a
   real device (StoreKit sandbox account). Verify: trial unlocks Plus, `isPlus()` reflects it,
   Restore works, and the localized price shows on the paywall.

### "The App Store sheet shows the full price, not the free trial"
The app never decides the trial. StoreKit does, at the moment Apple's own purchase sheet
appears. The app only *asks* StoreKit (`Store.trialAvailable`) whether a trial will apply and
adjusts its copy; if that check says no, the paywall says "Subscribe" instead of "Start free
trial". Two causes cover almost every case:

1. **The introductory offer is not attached to the product in App Store Connect.**
   Monetization → Subscriptions → *group* → each product → **Introductory Offers** → "+":
   type **Free**, duration **1 week**, all territories, no end date. It must exist on BOTH
   `camino_plus_annual` and `camino_plus_monthly`. The subscription itself must be at least
   "Ready to Submit". RevenueCat needs nothing extra. StoreKit applies the offer automatically.
2. **The Apple ID testing has already used its intro offer.** Apple grants one intro offer per
   subscription group per Apple ID. In sandbox / TestFlight that is consumed on the first test
   purchase. Reset it: App Store Connect → Users and Access → **Sandbox** → Testers → the
   tester → **Clear Purchase History** (or create a fresh sandbox tester). Then on the iPhone,
   Settings → App Store → Sandbox Account → sign in with that tester.

Diagnose in one glance: on the paywall, if the CTA says **"Start 7-day free trial"** the app
has confirmed eligibility and the Apple sheet will show "7 days free, then …". If it says
**"Subscribe to Plus"**, StoreKit reported no offer / not eligible / unknown. Fix (1) or (2).

## Decide before submission
- **Voice interview claim:** iOS `WKWebView` has no Web Speech API, so the simulator falls back to
  typed answers. Either soften the paywall "real voice simulation" copy, or add a native speech
  plugin (`@capacitor-community/speech-recognition`).
