import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: PlannerStore
    @State private var showingLogin = false
    @State private var showingProfile = false

    var body: some View {
        TabView {
            TaskListView()
                .tabItem {
                    Label("Tasks", systemImage: "checklist")
                }

            CalendarMonthView()
                .tabItem {
                    Label("Calendar", systemImage: "calendar")
                }

            ProfilesView(showingLogin: $showingLogin, showingProfile: $showingProfile)
                .tabItem {
                    Label("Profiles", systemImage: "person.3")
                }

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
        }
        .sheet(isPresented: $showingLogin) {
            ProfileLoginView()
                .environmentObject(store)
        }
        .sheet(isPresented: $showingProfile) {
            ProfileEditorView(member: store.currentMember)
                .environmentObject(store)
        }
        .task {
            _ = await NotificationManager.shared.requestAuthorizationIfNeeded()
        }
    }
}
