# App Review reply: Guideline 2.1 "Information Needed"

First submission (build 1.0 (7)) came back on 2026-08-14 asking for seven items.
This file answers them for **build 1.0 (10)**:

- **Reply text** (below): paste into the reply to App Review in App Store Connect,
  with the screen recording attached. Fill the two `[ ... ]` blanks first.
- **Notes field version** (further down, under 4,000 characters): goes in
  App Store Connect → App Review Information → Notes, as Apple asked
  ("Include this information in the Notes field… for future submissions").

---

## Reply text

Thank you for the review. Here is the requested information for build 1.0 (10).

**1. Screen recording**
Attached: `[camino-review-demo.mp4]`, recorded on a physical iPhone running the latest
iOS. It starts at app launch and shows onboarding, the Today tab, a civics lesson, the
English reading and writing drill, the Path tab (visa path map and document checklist),
the Learn tab (flashcards and a mock test), the Camino Plus paywall and the 7-day
free-trial purchase in the sandbox, Restore Purchases, the optional reminders
permission prompt, and switching the app to Spanish.

Camino has no account registration, login or account deletion: there are no accounts.
There is no user-generated content shared with other users, so there is no reporting or
blocking. The app asks for one optional permission, only when the user turns the feature
on: notifications (daily study reminders and date alerts, off by default). It does not
use App Tracking Transparency, the microphone, speech recognition, location, contacts,
camera or photos.

**2. Devices and OS tested**
`[e.g. iPhone 16 Pro, iOS 27.1 (physical); iPhone 13, iOS 27.1 (physical); iPhone 18 Pro Max and iPhone 17e simulators, iOS 27.1 in Xcode 27.1]`

**3. What the app does and who it is for**
Camino is a bilingual (English/Spanish) study and organization app for people going
through the U.S. immigration process, mainly lawful permanent residents preparing to
apply for naturalization (Form N-400), plus people on student, work or family paths who
want to understand the steps ahead.

The problem: the USCIS civics test, the English test and the N-400 paperwork are
intimidating, and the resources are scattered, mostly English-only and hard to stick
with. Camino turns preparation into a short daily habit: bite-size lessons on the
official USCIS civics questions (2025 test, 128 questions, and the 2008 test, 100
questions), flashcards and mock tests, English reading and writing practice, a
stage-by-stage map of the user's legal path with the official forms, and a document
checklist. It is educational self-help software. It does not give legal advice, file
anything with USCIS, or prepare forms for the user, and it tells users throughout to
consult a licensed attorney or DOJ-accredited representative about their own case.

**4. How to set up and access the main features**
No login, credentials or sample files are needed.

- Launch the app and complete the short onboarding (language, country, where you are on
  your path, your goal, family ties, education, field, job offer, optional special
  situations, daily goal). Any answers work. The last screen lists immigration paths the
  profile may fit (for example a family petition, TN, O-1, E-2 or TPS), labeled as
  educational guidance.
- **Today** tab: a countdown to the N-400 filing window or the USCIS interview date (set
  under Me) with a readiness ring and today's plan: civics, English reading and writing,
  flashcards. Tap a lesson to play it; tap **Reading & writing** for the English drill
  (sentences are read aloud and the user types what they hear).
- **Path** tab: **Steps** shows the stage map for the user's path (tap a stage for the
  plain-English guide and the USCIS forms); **Documents** shows the checklist, the
  educational N-400 walkthrough and the N-400 organizer (Plus).
- **Learn** tab: the full civics path, flashcards and mock tests (free plan: 3 mock
  tests per day).
- **Me** tab: language (English/Español), reminders, interview date, Restore Purchases,
  Clear all data.
- **Camino Plus**: any locked feature (for example the N-400 organizer) or the Camino
  Plus card on Me opens the paywall. It shows each subscription's name, length and
  localized price, links to the Terms of Use and Privacy Policy, and Restore Purchases.
  Both products (`camino_plus_monthly`, `camino_plus_annual`) include a 7-day free trial
  and can be bought with a sandbox Apple ID.

**5. External services**
- **Apple In-App Purchase (StoreKit)**: payments for Camino Plus.
- **RevenueCat**: subscription status (receives purchase status and an anonymous app
  user ID only).
- At launch the app downloads one public JSON file of visa bulletin dates from
  https://rumoave.github.io. It sends no user data; if it fails, the copy bundled in the
  app is used.
- No authentication provider, analytics, ads or AI service is called by the app.
  Lessons, guides, checklists, fonts and voice audio are bundled and work offline. The
  voice clips were pre-recorded with ElevenLabs text-to-speech when the app was built;
  the app does not contact ElevenLabs. The N-400 draft is filled on the device from the
  public-domain USCIS form; nothing is uploaded.

**6. Regional differences**
None. The app works the same in all regions, and the user picks English or Spanish in
the app. The content is about the U.S. immigration process, so it is most relevant to
people in or moving to the United States, but nothing is restricted by region.

**7. Regulated industry and third-party material**
Camino is educational self-help software, not a legal service, and needs no license. It
does not provide legal advice, representation or form-preparation services; the app's
disclaimer (shown at first launch), Terms and Privacy Policy say so. The reference
material is public-domain U.S. government work: the USCIS civics questions and answers,
USCIS form instructions and the official Form N-400 PDF. Voice audio was generated by us
with ElevenLabs. Fonts (Nunito, Fraunces) are under the SIL Open Font License; icons and
artwork are original or MIT-licensed.

Privacy Policy: https://rumoave.github.io/camino/privacy.html
Terms of Use: https://rumoave.github.io/camino/terms.html

---

## Notes field version (under 4,000 characters)

<!-- notes-field:start -->
Camino is a bilingual (English/Spanish) study and organization app for people going through the U.S. immigration process, mainly green-card holders preparing to apply for naturalization (Form N-400). It is educational self-help software: no legal advice, no filing with USCIS, no form preparation service.

ACCESS: No accounts, login or sample files. Complete the short onboarding (any answers work).

MAIN FEATURES
- Today: countdown to the N-400 filing window or interview date (set under Me), readiness ring, today's plan (civics, English reading and writing, flashcards).
- Path: Steps = stage map with plain-English guides and USCIS forms; Documents = checklist, N-400 walkthrough, N-400 organizer (Plus).
- Learn: civics path (2025 and 2008 tests), flashcards, mock tests (free: 3/day).
- Me: language EN/ES, reminders, interview date, Restore Purchases, Clear all data.

SUBSCRIPTION: Camino Plus, auto-renewable, camino_plus_monthly and camino_plus_annual, both with a 7-day free trial (testable with a sandbox Apple ID). Open the paywall from any locked feature (e.g. the N-400 organizer) or the Camino Plus card on Me. It shows name, length, localized price, Terms of Use and Privacy Policy links, and Restore Purchases.

PERMISSIONS: Only notifications, optional and off by default (study reminders and date alerts). No tracking, microphone, speech recognition, location, contacts, camera or photos.

EXTERNAL SERVICES: Apple In-App Purchase; RevenueCat (purchase status and an anonymous user ID only). At launch the app downloads a public visa bulletin JSON from rumoave.github.io (no user data sent; bundled copy used if it fails). No analytics, ads, authentication or AI service. Content, fonts and voice audio are bundled and work offline; voice clips were pre-recorded with ElevenLabs text-to-speech at build time. The N-400 draft is filled on the device from the public-domain USCIS form; nothing is uploaded.

REGIONS: Works the same everywhere; English or Spanish chosen in the app.

REGULATED / THIRD-PARTY MATERIAL: Not a legal service and needs no license; disclaimers at first launch, in Terms and in the Privacy Policy. Reference material is public-domain U.S. government work (USCIS civics questions, form instructions, Form N-400 PDF). Fonts under SIL Open Font License; icons and artwork original or MIT-licensed.

Privacy: https://rumoave.github.io/camino/privacy.html
Terms: https://rumoave.github.io/camino/terms.html
<!-- notes-field:end -->

---

## Screen recording script (item 1)

Record on a physical iPhone on the latest iOS, with **build 10 installed from TestFlight**
(Settings → Control Center → add Screen Recording). Delete any earlier copy of Camino so
onboarding shows. Sign in with a **sandbox** Apple ID (Settings → App Store → Sandbox
Account) so the purchase completes. Keep it under about 3 minutes; no narration needed.

1. Start recording on the Home Screen and tap the Camino icon (the launch must show).
2. Onboarding: English, the green card / N-400 path, a daily goal, finish.
3. Today: scroll once; open today's lesson; answer 3–4 questions (one wrong so the
   feedback shows); finish to show XP and streak.
4. Today → **Reading & writing**: play a sentence, write one sentence.
5. Path → Steps: tap a stage, scroll the guide, go back. Path → Documents: check off a
   document, open the N-400 walkthrough.
6. Learn: open Flashcards briefly; start a mock test and answer a couple.
7. Path → Documents → **N-400 organizer**: the paywall opens.
8. Paywall: show both plans and prices; tap Terms of Use, close; tap Privacy Policy,
   close; tap **Start 7-day free trial**, complete the sandbox purchase sheet, and show
   Plus active by opening the organizer.
9. Me: tap **Restore Purchases**; turn on **Reminders** so the notification prompt
   appears (tap Allow); switch the language to Español and show Today in Spanish.
10. Stop recording and save the .mp4 for the reply.

## Before submitting build 10

- Publish the updated `privacy.html` and `terms.html` on gh-pages (new prices, the visa
  bulletin disclosure). The reviewer opens these links.
- App Store Connect: build 10 attached to version 1.0 (done), Notes field updated,
  Terms of Use and Privacy links in the description, App Privacy labels checked.
- Reply to App Review with the reply text above and the recording attached, then submit.
