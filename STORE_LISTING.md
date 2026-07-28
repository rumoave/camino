# Camino — App Store Connect listing

Copy-paste into App Store Connect. Character limits noted; all fields below are within them.

---

## App Name (max 30)
```
Camino: US Citizenship Prep
```
*(27 chars)*

## Subtitle (max 30)
```
Civics test, N-400 & visas
```
*(26 chars)*

## Promotional Text (max 170 — editable anytime without review)
```
Study for the 2025 civics test, map your visa path, practice the interview, and organize your N-400 documents. Free to start, in English or Spanish.
```

## Keywords (max 100, comma-separated, no spaces after commas)
```
naturalization,n-400,uscis,green card,visa,h1b,opt,interview,flashcards,study,bilingual,español
```
*(Don't repeat words already in the name/subtitle — Apple indexes those separately.)*

## Description (max 4000)
```
Camino is your friendly companion through the U.S. immigration journey — civics test prep, your legal path, interview practice, and document organization, all in one app. In English and Spanish.

Private by design: no account, no sign-up, and your personal information stays on your device — we have no servers that receive it.

DAILY CIVICS PREP
• Study the 2025 USCIS civics questions in bite-size lessons
• Build a streak, earn XP, and see how "civics ready" you are
• Flashcards and mock tests to lock it in

KNOW YOUR PATH
• A stage-by-stage map from where you are today to the oath
• Guides for the paths that matter: N-400 naturalization, the H-1B lottery, pre- and post-completion OPT, family and employment green cards, asylum, the Diversity Visa, and more
• Plain-English "how it works" for each step, with the exact USCIS forms

PRACTICE THE INTERVIEW
• A realistic USCIS interview simulator that asks questions and scores your answers
• Hear questions read aloud; answer by voice or by typing

GET ORGANIZED
• A document checklist tailored to your path
• An educational N-400 walkthrough — section by section, what USCIS asks and why
• N-400 organizer (Plus): gather your answers section by section and generate a draft of the official form on your device — nothing ever leaves your phone
• Important dates and milestones in one place

BILINGUAL
Every screen works in English and Spanish, with more languages on the way.

CAMINO PLUS
Start with a 7-day free trial. Plus unlocks unlimited interview practice, unlimited mock tests, the N-400 organizer, an extra civics unit, streak freezes, and more. Subscriptions renew automatically; manage or cancel anytime in your App Store settings.

IMPORTANT
Camino is an educational study and preparation app. It is not a law firm and does not provide legal advice. Immigration outcomes depend on your specific situation — for advice about your case, consult a licensed immigration attorney or a BIA-accredited representative. Camino is not affiliated with USCIS or any government agency.

Your data stays on your device. We don't sell or share your personal information.
```

---

## Categories
- **Primary:** Education
- **Secondary:** Reference

## Age Rating
**4+** — no objectionable content. (When filling the questionnaire, answer "None" to all content descriptors.)

## URLs you must provide
- **Support URL:** https://rumoave.github.io/camino/support.html
- **Privacy Policy URL:** https://rumoave.github.io/camino/privacy.html
- **Marketing URL:** (optional — leave blank)

*(Both hosted on GitHub Pages from the `gh-pages` branch of this repo. Edit the HTML there and push to update.)*

## App Privacy ("nutrition label") answers
v1 has no accounts and no analytics — data is on-device. The only external SDK is **RevenueCat** (subscriptions). Declare:
- **Purchases** → collected → *App Functionality* → **Not linked** to the user → **not** used for tracking
- **Identifiers** (RevenueCat's anonymous app-user ID) → collected → *App Functionality* → **Not linked** → **not** tracking
- Everything else: **Data Not Collected**
- **App Tracking Transparency:** not required (you don't track across apps/websites)

*(Follow RevenueCat's official privacy-label guidance to confirm before submitting.)*

## In-App Purchases to create (auto-renewable, one Subscription Group "Camino Plus")
- `camino_plus_annual` — $49.99/year — **7-day free trial** introductory offer
- `camino_plus_monthly` — $7.99/month — **7-day free trial** introductory offer
- These IDs must match `STORE_CONFIG.products` in app.js. Each needs a display name, a review screenshot, and a description before it can be submitted.

---

## Suggested screenshot captions (optional overlays)
1. **1-home** — "By your side, every step of the journey"
2. **2-path** — "Every step, mapped — with the exact forms"
3. **3-lesson** — "Learn the 2025 civics test, one question at a time"
4. **4-interview** — "Practice the real USCIS interview"
5. **5-learn** — "A guided path from start to the oath"
6. **6-docs** — "Organize your N-400 documents"
7. **7-home-es** — "Completely bilingual — English & Spanish"

Screenshots are in `Desktop/camino-appstore/` at 1290×2796 (6.9"). Apple auto-scales this size down for smaller devices, so this one set covers the required iPhone sizes.
