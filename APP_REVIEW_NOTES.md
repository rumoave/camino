# App Review reply: Guideline 2.1 "Information Needed" (rejected 2026-08-14, build 1.0 (7))

Apple asked for seven items. Everything below is ready to paste into
**App Store Connect → App Review Information → Notes**, and into the reply thread
in Resolution Center. Fill in the two `[ ... ]` blanks (devices + attachment name)
before sending.

Also attach the screen recording (item 1) to the Resolution Center reply. See
the recording script at the bottom of this file.

---

## Paste this into the Notes field / Resolution Center reply

Thank you for the review. Here is the requested information.

**1. Screen recording**
Attached: `[camino-review-demo.mp4]`, recorded on a physical iPhone running the
latest iOS. It starts at app launch and walks through onboarding, the Today tab,
a civics lesson, the Journey (visa path) map, the interview simulator (which
triggers the microphone permission prompt), the Documents checklist, the Camino
Plus paywall and the 7-day free-trial purchase flow (sandbox), Restore Purchases,
and the English ⇄ Spanish toggle.

Camino has no account registration, login, or account deletion. There are no
accounts. There is no user-generated content shared with other users, so there
are no reporting or blocking mechanisms. The only system permission the app
requests is the microphone (optional, for practicing interview answers out loud).
The app does not use App Tracking Transparency, location, contacts, camera, or
photos.

**2. Devices and OS tested**
`[e.g. iPhone 15 Pro, iOS 18.x (physical); iPhone 13, iOS 18.x (physical);
iPhone 16 Pro / iPhone SE (3rd gen) simulators, iOS 18.x in Xcode 16]`

**3. What the app does and who it is for**
Camino is a bilingual (English/Spanish) study and organization app for people
going through the U.S. immigration process, primarily lawful permanent residents
preparing to apply for naturalization (Form N-400), plus people on student, work,
or family paths who want to understand the steps ahead.

The problem it solves: the USCIS civics test, the naturalization interview, and
the N-400 paperwork are intimidating, and existing resources are scattered,
English-only, and not engaging. Camino turns preparation into a short daily
habit: bite-size lessons on the official USCIS civics questions, streaks and XP,
flashcards and mock tests, a spoken-question interview simulator, a stage-by-stage
map of the legal path, and a document checklist. It is educational, self-help
software. It does not give legal advice, does not file anything with USCIS, and
tells users throughout to consult a licensed attorney or DOJ-accredited
representative for their specific case.

**4. How to set up and access the main features**
No login or credentials are needed. Nothing needs to be downloaded or imported.

- Launch the app → short onboarding (choose language, country, where you are on
  your path, your goal, family ties in the U.S., education level, field,
  job-offer status, optional special situations, and a daily goal). Any answers
  work. The final screen lists immigration paths the profile may qualify for
  (for example a family petition, TN, O-1, E-2, or TPS); this is educational
  guidance only and is labeled as such.
- **Today** tab: streak, "civics readiness," and today's lesson. Tap the lesson
  card to play a civics lesson.
- **Journey** tab: the stage map for the selected path; tap any stage for the
  plain-English guide and the USCIS forms involved.
- **Learn** tab: the full civics path, flashcards, and mock tests (free plan:
  3 mock tests per day).
- **Interview** (from Today or Learn): the simulator reads a question aloud; tap
  the mic to answer by voice (this triggers the microphone prompt) or type an
  answer. Free plan: 3 practice sessions per day.
- **Docs** tab: document checklist for the selected path, key dates, the
  educational N-400 walkthrough, and the N-400 organizer (Plus).
- **Camino Plus**: any locked feature, or Profile → Upgrade, opens the paywall.
  The paywall shows each subscription's name, length, and localized price, with
  links to Terms of Use (Apple's standard EULA) and the Privacy Policy, and a
  Restore Purchases button. Both products (`camino_plus_annual`,
  `camino_plus_monthly`) include a 7-day free trial and can be tested with a
  sandbox Apple ID.
- Language can be switched at any time from the Profile screen (EN/ES).

**5. External services**
- **Apple In-App Purchase (StoreKit)**: payment processing for Camino Plus.
- **RevenueCat**: subscription entitlement management (receives purchase status
  and an anonymous app-user ID only).
- No authentication provider, no analytics SDK, no ads, no data providers, and no
  AI service is called by the app. All content (civics questions, guides,
  checklists, audio for spoken questions) is bundled inside the app and works
  offline. The N-400 draft feature fills the public-domain USCIS form entirely on
  the device; nothing is uploaded.

**6. Regional differences**
None. The app functions identically in all regions. The user chooses English or
Spanish in-app regardless of region. Content is about the U.S. immigration
process, so it is most relevant to users in or moving to the United States, but
it is not gated by region.

**7. Regulated industry / third-party material**
Camino is educational self-help software, not a legal service, and is not
subject to licensing. It does not provide legal advice, representation, or form
preparation services, and this is stated in the app's disclaimers, Terms, and
Privacy Policy. All reference material comes from public-domain U.S. government
sources: the USCIS 100 civics questions and answers, USCIS form instructions, and
the official USCIS Form N-400 PDF, which are works of the U.S. federal government
and not subject to copyright. Audio narration was generated by us. Icons and
artwork are original or MIT-licensed.

Privacy Policy: https://rumoave.github.io/camino/privacy.html
Terms of Use: https://rumoave.github.io/camino/terms.html

---

## Screen recording script (item 1)

Record on a physical iPhone (Settings → Control Center → add Screen Recording).
Delete the app first so onboarding shows. Sign in with a **sandbox** Apple ID
(Settings → App Store → Sandbox Account) so the purchase completes. Keep it
under ~3 minutes; no narration needed.

1. Tap the Camino icon on the Home screen (must show launch).
2. Onboarding: pick English, pick a path (N-400), pick a daily goal, finish.
3. Today tab: scroll once; tap today's lesson; answer 3–4 questions (one wrong
   so feedback shows); finish the lesson to show XP/streak.
4. Journey tab: tap a stage, scroll the guide, back out.
5. Learn tab: open Flashcards briefly; open Mock test, answer a couple.
6. Interview: start a session; the microphone prompt appears → tap **Allow**;
   answer one question by voice; answer one by typing.
7. Docs tab: check off a document; open the N-400 walkthrough; tap the N-400
   organizer → paywall appears.
8. Paywall: show both plans and prices, tap Terms of Use, close; tap Privacy,
   close; tap **Start 7-day free trial** → complete the sandbox purchase sheet
   → return to app showing Plus active; open the organizer to prove it unlocked.
9. Profile: tap **Restore Purchases**; switch language to Español and show the
   Today tab in Spanish.
10. Stop recording. AirDrop/upload the .mp4 and attach it in Resolution Center.

## Before you archive build 8

- Confirm `NSMicrophoneUsageDescription` is in `ios/App/App/Info.plist`
  (see BUILD.md). Without it the mic tap in step 6 crashes on device, which
  would be a real 2.1 rejection.
- Bump the build number in Xcode (1.0 (8)).
- App Store Connect: both subscriptions must be **Ready to Submit** with the
  7-day introductory offer attached, and the Privacy Policy URL set.
- Paste the text above into App Review Information → Notes so it ships with the
  build, and also reply in Resolution Center with the recording attached.
