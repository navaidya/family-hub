import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var store: PlannerStore
    @State private var notificationStatus = "Not checked"

    var body: some View {
        NavigationStack {
            List {
                Section("Apple features") {
                    Button {
                        Task {
                            let granted = await NotificationManager.shared.requestAuthorizationIfNeeded()
                            notificationStatus = granted ? "Allowed" : "Not allowed"
                        }
                    } label: {
                        Label("Enable local reminders", systemImage: "bell.badge")
                    }

                    HStack {
                        Text("Notification status")
                        Spacer()
                        Text(notificationStatus)
                            .foregroundStyle(.secondary)
                    }

                    Text("Calendar add uses Apple Calendar permission when you add a task due date from task details.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                Section("Sharing roadmap") {
                    Label("iCloud sync with CloudKit", systemImage: "icloud")
                    Label("Home Screen widgets", systemImage: "square.grid.2x2")
                    Label("Family controls", systemImage: "person.2.badge.gearshape")
                    Label("App Store or TestFlight distribution", systemImage: "paperplane")
                }

                Section("Local data") {
                    Text("\(store.tasks.count) tasks")
                    Text("\(store.members.count) profiles")
                }
            }
            .navigationTitle("Settings")
        }
    }
}
