# Family Hub iOS

Native SwiftUI version of Family Hub.

## What is implemented

- Family profiles for Naval, Priyanka, Vivan, and Yuvika
- Profile switching with optional local PINs
- Task and ask list with requester, assignee, status, priority, requirements, and comments
- Month calendar with due-date indicators
- Local notification scheduling for task reminders
- Apple Calendar add action from task details
- Local persistence through `UserDefaults`

## Open and run

Open `FamilyPlanner.xcodeproj` in Xcode, select an iPhone simulator or physical iPhone, then run the app target.

This app currently stores data locally on one device. To share live data across everyone’s Apple devices, the next native step is CloudKit/iCloud sync, followed by widgets and richer notification actions.
