// Exposes the RevenueCat Capacitor SDK on window.Purchases so the no-bundler app
// (app.js → Store) can call it. esbuild bundles this into www/revenuecat.js during
// the iOS build (see BUILD.md / npm run build:rc). Not used on web.
import { Purchases } from '@revenuecat/purchases-capacitor';
window.Purchases = Purchases;
