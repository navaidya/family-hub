# Family Planner

A browser-based family task planner with a task list, task discussion, assignment, calendar due-date tracking, and email reminder composition.

Open `index.html` in a browser. Tasks are saved to local browser storage, and backup import/export is available from the header.

Each family member has a local profile. Use **Switch** to log in as Naval, Priyanka, Vivan, or Yuvika, and use the current profile button to edit that member's name, age, email, color, optional PIN, reminder window, and digest preference. New tasks and comments default to the signed-in profile.

Email reminder buttons use `mailto:` links, so they open the default email client with a prefilled progress message. Automatic background email delivery would require a small backend with SMTP or an email provider.

PINs are stored in the browser's local storage for lightweight household use. They are not secure account authentication.

## Native iOS app

A SwiftUI iOS version is scaffolded in `FamilyPlannerIOS/`. Open `FamilyPlannerIOS/FamilyPlanner.xcodeproj` in Xcode to run it on an iPhone or simulator.

## Without Xcode

The web planner now includes Progressive Web App files:

- `manifest.webmanifest`
- `service-worker.js`
- `icons/family-planner-icon.svg`

When hosted on HTTPS, family members can open the web address in Safari on iPhone, use Share -> Add to Home Screen, and launch it like an app. Service workers do not run from a `file://` URL, so offline caching starts after serving or hosting the app over `http://localhost` or HTTPS.
