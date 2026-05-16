# Family Hub

A browser-based family hub with a task list, task discussion, assignment, calendar due-date tracking, and email reminder composition.

Open `index.html` in a browser. Tasks are saved to local browser storage, and backup import/export is available from the header.

Each family member has a local profile. Use **Switch** to log in as Naval, Priyanka, Vivan, or Yuvika, and use the current profile button to edit that member's name, age, email, color, optional PIN, reminder window, and digest preference. New tasks and comments default to the signed-in profile.

Default household PINs are set for each member: Naval `1980`, Priyanka `1983`, Vivan `2010`, and Yuvika `2017`. Each member can change their own PIN from profile settings. Naval is the admin profile and can reset any family member's PIN from his profile settings.

Email reminder buttons use `mailto:` links, so they open the default email client with a prefilled progress message. Automatic background email delivery would require a small backend with SMTP or an email provider.

PINs are stored in the browser's local storage, and in Firestore when sync is enabled, for lightweight household use. They are not secure account authentication.

## Native iOS app

A SwiftUI iOS version is scaffolded in `FamilyPlannerIOS/`. Open `FamilyPlannerIOS/FamilyPlanner.xcodeproj` in Xcode to run it on an iPhone or simulator.

## Without Xcode

The web planner now includes Progressive Web App files:

- `manifest.webmanifest`
- `service-worker.js`
- `icons/family-hub-icon.svg`

When hosted on HTTPS, family members can open the web address in Safari on iPhone, use Share -> Add to Home Screen, and launch it like an app. Service workers do not run from a `file://` URL, so offline caching starts after serving or hosting the app over `http://localhost` or HTTPS.

## Firebase sync

Family Hub can sync shared tasks and member settings through Firebase Authentication and Cloud Firestore.

1. Create a Firebase project.
2. Add a Web app in Firebase project settings.
3. Copy the web app config values into `firebase-config.js`.
4. In Firebase Authentication, enable Email/Password sign-in.
5. In Firestore Database, create a database.
6. Edit `firestore.rules` and replace the placeholder emails with your family emails.
7. Paste/publish those rules in Firebase Firestore Rules.
8. Deploy/push this repo to GitHub Pages.
9. Open Family Hub, click the cloud button, and create/sign in with each family login.

The website is still hosted by GitHub Pages. Firebase stores the shared family data in Google's cloud. The active profile on each device remains local so one person switching profiles does not change everyone else's current profile.

## GitHub Pages deploy speed

Family Hub is a static site and does not need a build step. The `.nojekyll` file tells GitHub Pages to skip Jekyll processing and serve the checked-in files directly.
