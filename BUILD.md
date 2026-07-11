# Camino — iOS build (Capacitor)

Camino is a plain web app (`index.html` + `app.js` + `styles.css`) wrapped with
[Capacitor](https://capacitorjs.com/) for the App Store. No bundler — `scripts/build-web.js`
just stages the web files into `www/`, which Capacitor copies into the native iOS project.

## Prerequisites
- **A Mac** (or cloud Mac) with **Xcode** + **CocoaPods** — required by Apple to build/submit.
- **Node 18+** (to run Capacitor CLI).
- Apple Developer Program membership (you have this).

## One-time setup (on the Mac)
```bash
npm install
npm run build:web          # stages web files into www/
npx cap add ios            # generates the native ios/ project (Mac only — needs CocoaPods)
npm run assets             # generates all icon + splash sizes from resources/icon.png & splash.png
npx cap sync ios           # copies web assets + installs native plugins into the ios/ project
npm run open:ios           # opens ios/App/App.xcworkspace in Xcode
```

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
npm run sync    # build:web + cap sync ios  (then re-run in Xcode)
```

## Notes
- `www/` and the generated `ios/` are gitignored (rebuilt from source).
- `config.local.js` (dev Anthropic key) and `sw.js` (service worker) are intentionally
  excluded from the bundle — Cami is disabled in v1 and service workers aren't used natively.
- Icon/splash sources live in `resources/` (`icon.png` 1024², `splash.png` 2732²).
  Re-render them from `resources/icon.html` / `splash.html` if you change the art.

## In-App Purchases (RevenueCat) — already wired in code
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

## Decide before submission
- **Voice interview claim:** iOS `WKWebView` has no Web Speech API, so the simulator falls back to
  typed answers. Either soften the paywall "real voice simulation" copy, or add a native speech
  plugin (`@capacitor-community/speech-recognition`).
