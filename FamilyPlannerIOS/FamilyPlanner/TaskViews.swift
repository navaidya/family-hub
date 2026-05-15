import SwiftUI

struct TaskListView: View {
    @EnvironmentObject private var store: PlannerStore
    @State private var query = ""
    @State private var status: TaskStatus?
    @State private var editingTask: PlannerTask?
    @State private var showingNewTask = false

    private var filteredTasks: [PlannerTask] {
        store.sortedTasks.filter { task in
            let matchesStatus = status == nil || task.status == status
            let searchText = [
                task.title,
                task.requirements,
                store.memberName(task.requesterId),
                store.memberName(task.assigneeId)
            ].joined(separator: " ").lowercased()
            return matchesStatus && (query.isEmpty || searchText.contains(query.lowercased()))
        }
    }

    var body: some View {
        NavigationStack {
            List {
                currentProfileSection
                statusFilterSection
                taskSection
            }
            .navigationTitle("Family Planner")
            .searchable(text: $query, prompt: "Search tasks")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingNewTask = true
                    } label: {
                        Label("New task", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingNewTask) {
                TaskEditorView(task: nil)
                    .environmentObject(store)
            }
            .sheet(item: $editingTask) { task in
                TaskDetailView(task: task)
                    .environmentObject(store)
            }
        }
    }

    private var currentProfileSection: some View {
        Section {
            HStack(spacing: 12) {
                AvatarView(member: store.currentMember, size: 44)
                VStack(alignment: .leading) {
                    Text(store.currentMember.name)
                        .font(.headline)
                    Text("Signed in profile")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
            }
            .padding(.vertical, 4)
        }
    }

    private var statusFilterSection: some View {
        Section {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    FilterChip(title: "All", selected: status == nil) {
                        status = nil
                    }
                    ForEach(TaskStatus.allCases) { item in
                        FilterChip(title: item.label, selected: status == item) {
                            status = item
                        }
                    }
                }
                .padding(.vertical, 4)
            }
        }
    }

    private var taskSection: some View {
        Section("Tasks and asks") {
            if filteredTasks.isEmpty {
                ContentUnavailableView("No tasks", systemImage: "checklist", description: Text("Add an ask, task, appointment, or decision."))
            } else {
                ForEach(filteredTasks) { task in
                    Button {
                        editingTask = task
                    } label: {
                        TaskRowView(task: task)
                    }
                    .buttonStyle(.plain)
                }
                .onDelete { indexSet in
                    indexSet.map { filteredTasks[$0] }.forEach(store.deleteTask)
                }
            }
        }
    }
}

struct TaskRowView: View {
    @EnvironmentObject private var store: PlannerStore
    let task: PlannerTask

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            RoundedRectangle(cornerRadius: 4)
                .fill(statusColor)
                .frame(width: 5)

            VStack(alignment: .leading, spacing: 6) {
                Text(task.title)
                    .font(.headline)
                    .foregroundStyle(.primary)

                HStack {
                    Label(task.type.label, systemImage: "tag")
                    Label(task.status.label, systemImage: "circle.dashed")
                }
                .font(.caption)
                .foregroundStyle(.secondary)

                Text("\(store.memberName(task.requesterId)) asked · \(store.memberName(task.assigneeId))")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(task.dueDate, format: .dateTime.month(.abbreviated).day())
                    .font(.subheadline.weight(.semibold))
                if task.priority == .high {
                    Text("High")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.red)
                }
            }
        }
        .padding(.vertical, 6)
    }

    private var statusColor: Color {
        if task.status == .done { return .green }
        if Calendar.current.startOfDay(for: task.dueDate) < Calendar.current.startOfDay(for: .now) { return .red }
        return task.priority == .high ? .orange : .teal
    }
}

struct TaskDetailView: View {
    @EnvironmentObject private var store: PlannerStore
    @Environment(\.dismiss) private var dismiss
    @State private var showingEditor = false
    @State private var commentText = ""
    let task: PlannerTask

    private var latestTask: PlannerTask {
        store.tasks.first(where: { $0.id == task.id }) ?? task
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(latestTask.title)
                            .font(.title2.weight(.bold))
                        Text(latestTask.requirements.isEmpty ? "No requirements added." : latestTask.requirements)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                Section("Details") {
                    DetailRow(title: "Status", value: latestTask.status.label)
                    DetailRow(title: "Due", value: latestTask.dueDate.formatted(date: .abbreviated, time: .omitted))
                    DetailRow(title: "Requested by", value: store.memberName(latestTask.requesterId))
                    DetailRow(title: "Assigned to", value: store.memberName(latestTask.assigneeId))
                }

                Section("Conversation") {
                    if latestTask.comments.isEmpty {
                        Text("No discussion yet.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(latestTask.comments) { comment in
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(store.memberName(comment.authorId)) · \(comment.createdAt.formatted(date: .abbreviated, time: .shortened))")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Text(comment.text)
                            }
                        }
                    }

                    HStack {
                        TextField("Add a note", text: $commentText)
                        Button("Send") {
                            let trimmed = commentText.trimmingCharacters(in: .whitespacesAndNewlines)
                            guard !trimmed.isEmpty else { return }
                            store.addComment(to: latestTask, text: trimmed)
                            commentText = ""
                        }
                    }
                }

                Section {
                    Button {
                        store.advance(latestTask)
                    } label: {
                        Label(nextActionTitle, systemImage: "arrow.forward.circle")
                    }

                    Button {
                        Task {
                            try? await CalendarIntegration.shared.addDueDate(for: latestTask)
                        }
                    } label: {
                        Label("Add to Apple Calendar", systemImage: "calendar.badge.plus")
                    }
                }
            }
            .navigationTitle("Task")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
                ToolbarItem(placement: .primaryAction) {
                    Button("Edit") { showingEditor = true }
                }
            }
            .sheet(isPresented: $showingEditor) {
                TaskEditorView(task: latestTask)
                    .environmentObject(store)
            }
        }
    }

    private var nextActionTitle: String {
        switch latestTask.status {
        case .todo: "Move to discussion"
        case .discussion: "Assign"
        case .assigned: "Mark done"
        case .done: "Done"
        }
    }
}

struct TaskEditorView: View {
    @EnvironmentObject private var store: PlannerStore
    @Environment(\.dismiss) private var dismiss

    let task: PlannerTask?
    @State private var title = ""
    @State private var type: PlannerTaskType = .todo
    @State private var status: TaskStatus = .todo
    @State private var requesterId = ""
    @State private var assigneeId = ""
    @State private var dueDate = Date()
    @State private var priority: TaskPriority = .normal
    @State private var requirements = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Task") {
                    TextField("Title", text: $title)
                    Picker("Type", selection: $type) {
                        ForEach(PlannerTaskType.allCases) { item in
                            Text(item.label).tag(item)
                        }
                    }
                    Picker("Status", selection: $status) {
                        ForEach(TaskStatus.allCases) { item in
                            Text(item.label).tag(item)
                        }
                    }
                    Picker("Priority", selection: $priority) {
                        ForEach(TaskPriority.allCases) { item in
                            Text(item.label).tag(item)
                        }
                    }
                }

                Section("People") {
                    Picker("Requested by", selection: $requesterId) {
                        ForEach(store.members) { member in
                            Text(member.name).tag(member.id)
                        }
                    }
                    Picker("Assigned to", selection: $assigneeId) {
                        Text("Unassigned").tag("")
                        ForEach(store.members) { member in
                            Text(member.name).tag(member.id)
                        }
                    }
                }

                Section("Due date") {
                    DatePicker("Due", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                }

                Section("Requirements") {
                    TextEditor(text: $requirements)
                        .frame(minHeight: 120)
                }
            }
            .navigationTitle(task == nil ? "New Task" : "Edit Task")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear(perform: load)
        }
    }

    private func load() {
        if let task {
            title = task.title
            type = task.type
            status = task.status
            requesterId = task.requesterId
            assigneeId = task.assigneeId ?? ""
            dueDate = task.dueDate
            priority = task.priority
            requirements = task.requirements
        } else {
            requesterId = store.currentMemberId
            dueDate = Calendar.current.date(byAdding: .day, value: 1, to: .now) ?? .now
        }
    }

    private func save() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let updated = PlannerTask(
            id: task?.id ?? UUID(),
            title: trimmedTitle,
            type: type,
            status: status,
            requesterId: requesterId,
            assigneeId: assigneeId.isEmpty ? nil : assigneeId,
            dueDate: dueDate,
            priority: priority,
            requirements: requirements.trimmingCharacters(in: .whitespacesAndNewlines),
            comments: task?.comments ?? [],
            createdAt: task?.createdAt ?? .now,
            updatedAt: .now
        )

        if task == nil {
            store.addTask(updated)
        } else {
            store.updateTask(updated)
        }
        dismiss()
    }
}

struct FilterChip: View {
    let title: String
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(selected ? Color.indigo : Color.gray.opacity(0.12), in: Capsule())
                .foregroundStyle(selected ? .white : .primary)
        }
        .buttonStyle(.plain)
    }
}

struct DetailRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(title)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
        }
    }
}
