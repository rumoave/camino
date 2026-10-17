// Exposes the Capacitor plugin SDKs on window.* so the no-bundler app (app.js)
// can call them. esbuild bundles this into www/revenuecat.js during the iOS
// build (see BUILD.md / npm run build:rc). Not used on web.
import { Purchases } from '@revenuecat/purchases-capacitor';
import { Browser } from '@capacitor/browser';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { LocalNotifications } from '@capacitor/local-notifications';
window.Purchases = Purchases;
window.CapBrowser = Browser;
window.CapFilesystem = Filesystem;
window.CapFsDirectory = Directory;
window.CapFsEncoding = Encoding;
window.CapShare = Share;
window.CapLocalNotifications = LocalNotifications; // streak, trial and date reminders on iOS
