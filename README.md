# Family Hub

A browser-based family hub with tasks, Dreams, vacation planning, finance tracking, notebooks, dashboard summaries, and reminder composition.

Open `index.html` in a browser for local testing, or use the GitHub Pages URL for the hosted app. Family data is saved locally until Firebase sync is configured and a Google account signs in.

The main page includes a local Family Hub Assistant for quick questions about current task data, such as due dates, ownership, overdue tasks, unassigned work, and per-person summaries. This assistant is rule-based and does not send family data to an AI service.

Each family member has a profile. The current Google account maps to a member by email when Firebase sync is on. Use the account menu to edit profile settings or configure the family workspace.

Email reminder buttons use `mailto:` links, so they open the default email client with a prefilled progress message. Automatic background email delivery would require a small backend with SMTP or an email provider.

## Native iOS app

A SwiftUI iOS version is scaffolded in `FamilyPlannerIOS/`. Open `FamilyPlannerIOS/FamilyPlanner.xcodeproj` in Xcode to run it on an iPhone or simulator.

## Without Xcode

The web planner now includes Progressive Web App files:

- `manifest.webmanifest`
- `service-worker.js`
- `icons/family-hub-icon.svg`

When hosted on HTTPS, family members can open the web address in Safari on iPhone, use Share -> Add to Home Screen, and launch it like an app. Service workers do not run from a `file://` URL, so offline caching starts after serving or hosting the app over `http://localhost` or HTTPS.

## Firebase sync

Family Hub can sync shared family workspaces through Firebase Authentication, Cloud Firestore, and Firebase Storage for note and vacation attachments.

1. Create a Firebase project.
2. Add a Web app in Firebase project settings.
3. Copy the web app config values into `firebase-config.js`.
4. In Firebase Authentication, enable Google sign-in.
5. In Firestore Database, create a database.
6. Publish `firestore.rules` in Firebase Firestore Rules.
7. In Firebase Storage, create a storage bucket and publish `storage.rules`.
8. Deploy/push this repo to GitHub Pages.
9. Open Family Hub, sign in with Google, and configure the family workspace from the account menu.

The website is still hosted by GitHub Pages. Firebase stores each family workspace in Google's cloud under `families/{familyId}`. Attachments are stored in Firebase Storage under `families/{familyId}/...`. Access is based on allowed member emails stored on that family document.

## GitHub Pages deploy speed

Family Hub is a static site and does not need a build step. The `.nojekyll` file tells GitHub Pages to skip Jekyll processing and serve the checked-in files directly.
