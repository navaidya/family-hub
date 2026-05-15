import SwiftUI

struct ProfilesView: View {
    @EnvironmentObject private var store: PlannerStore
    @Binding var showingLogin: Bool
    @Binding var showingProfile: Bool

    var body: some View {
        NavigationStack {
            List {
                Section("Signed in") {
                    HStack(spacing: 12) {
                        AvatarView(member: store.currentMember, size: 54)
                        VStack(alignment: .leading) {
                            Text(store.currentMember.name)
                                .font(.title3.weight(.bold))
                            Text("\(store.currentMember.age) years old")
                                .foregroundStyle(.secondary)
                        }
                    }
                    Button("Edit current profile") {
                        showingProfile = true
                    }
                    Button("Switch profile") {
                        showingLogin = true
                    }
                }

                Section("Family") {
                    ForEach(store.members) { member in
                        HStack {
                            AvatarView(member: member, size: 38)
                            VStack(alignment: .leading) {
                                Text(member.name)
                                    .font(.headline)
                                Text("\(member.age) yrs · \(assignedCount(for: member)) assigned · \(requestedCount(for: member)) asked")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            if member.id == store.currentMemberId {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(.teal)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Profiles")
        }
    }

    private func assignedCount(for member: FamilyMember) -> Int {
        store.tasks.filter { $0.assigneeId == member.id && $0.status != .done }.count
    }

    private func requestedCount(for member: FamilyMember) -> Int {
        store.tasks.filter { $0.requesterId == member.id && $0.status != .done }.count
    }
}

struct ProfileLoginView: View {
    @EnvironmentObject private var store: PlannerStore
    @Environment(\.dismiss) private var dismiss
    @State private var selectedMemberId = ""
    @State private var pin = ""
    @State private var errorText = ""

    var body: some View {
        NavigationStack {
            List {
                Section("Choose profile") {
                    ForEach(store.members) { member in
                        Button {
                            selectedMemberId = member.id
                            pin = ""
                            errorText = ""
                        } label: {
                            HStack {
                                AvatarView(member: member, size: 42)
                                VStack(alignment: .leading) {
                                    Text(member.name)
                                        .font(.headline)
                                    Text(member.pin.isEmpty ? "No PIN set" : "PIN enabled")
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                if selectedMemberId == member.id {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundStyle(.teal)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }

                Section("PIN") {
                    SecureField("Only needed if set", text: $pin)
                    if !errorText.isEmpty {
                        Text(errorText)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("Login")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Login") {
                        login()
                    }
                }
            }
            .onAppear {
                selectedMemberId = store.currentMemberId
            }
        }
    }

    private func login() {
        guard let member = store.member(selectedMemberId) else { return }
        if store.login(as: member, pin: pin) {
            dismiss()
        } else {
            errorText = "That PIN does not match."
        }
    }
}

struct ProfileEditorView: View {
    @EnvironmentObject private var store: PlannerStore
    @Environment(\.dismiss) private var dismiss

    @State private var member: FamilyMember

    init(member: FamilyMember) {
        _member = State(initialValue: member)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack(spacing: 12) {
                        AvatarView(member: member, size: 54)
                        VStack(alignment: .leading) {
                            Text(member.name)
                                .font(.title3.weight(.bold))
                            Text("Profile settings")
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                Section("Identity") {
                    TextField("Name", text: $member.name)
                    Stepper("Age: \(member.age)", value: $member.age, in: 1...120)
                    TextField("Email", text: $member.email)
                    ColorPicker("Color", selection: colorBinding)
                }

                Section("Security") {
                    SecureField("Optional PIN", text: $member.pin)
                    Text("This is a lightweight household PIN stored on the device.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("Reminders") {
                    Stepper("Reminder window: \(member.settings.reminderDays) days", value: $member.settings.reminderDays, in: 1...30)
                    Toggle("Include in digest emails", isOn: $member.settings.includeInDigest)
                }
            }
            .navigationTitle(member.name)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        store.saveProfile(member)
                        dismiss()
                    }
                }
            }
        }
    }

    private var colorBinding: Binding<Color> {
        Binding {
            Color(hex: member.colorHex)
        } set: { color in
            member.colorHex = color.toHex() ?? member.colorHex
        }
    }
}

struct AvatarView: View {
    let member: FamilyMember
    let size: CGFloat

    var body: some View {
        ZStack {
            Circle()
                .fill(Color(hex: member.colorHex))
            Text(initials)
                .font(.system(size: size * 0.36, weight: .bold))
                .foregroundStyle(.white)
        }
        .frame(width: size, height: size)
        .accessibilityLabel(member.name)
    }

    private var initials: String {
        member.name
            .split(separator: " ")
            .compactMap(\.first)
            .prefix(2)
            .map(String.init)
            .joined()
            .uppercased()
    }
}

private extension Color {
    func toHex() -> String? {
        #if canImport(UIKit)
        let uiColor = UIColor(self)
        var red: CGFloat = 0
        var green: CGFloat = 0
        var blue: CGFloat = 0
        var alpha: CGFloat = 0
        guard uiColor.getRed(&red, green: &green, blue: &blue, alpha: &alpha) else { return nil }
        return String(
            format: "#%02X%02X%02X",
            Int(red * 255),
            Int(green * 255),
            Int(blue * 255)
        )
        #else
        return nil
        #endif
    }
}
