import Foundation

@MainActor
final class PlannerStore: ObservableObject {
    @Published var members: [FamilyMember] {
        didSet { save() }
    }

    @Published var tasks: [PlannerTask] {
        didSet { save() }
    }

    @Published var currentMemberId: String {
        didSet { save() }
    }

    private let storageKey = "family-planner-ios-state-v1"

    init() {
        if
            let data = UserDefaults.standard.data(forKey: storageKey),
            let snapshot = try? JSONDecoder.planner.decode(PlannerSnapshot.self, from: data)
        {
            members = snapshot.members
            tasks = snapshot.tasks
            currentMemberId = snapshot.currentMemberId
        } else {
            members = FamilyMember.defaults
            tasks = PlannerTask.samples()
            currentMemberId = FamilyMember.defaults[0].id
        }
    }

    var currentMember: FamilyMember {
        members.first(where: { $0.id == currentMemberId }) ?? members[0]
    }

    var sortedTasks: [PlannerTask] {
        tasks.sorted { first, second in
            if first.status == .done && second.status != .done { return false }
            if first.status != .done && second.status == .done { return true }
            if !Calendar.current.isDate(first.dueDate, inSameDayAs: second.dueDate) {
                return first.dueDate < second.dueDate
            }
            return first.updatedAt > second.updatedAt
        }
    }

    func memberName(_ id: String?) -> String {
        guard let id else { return "Unassigned" }
        return members.first(where: { $0.id == id })?.name ?? "Unassigned"
    }

    func member(_ id: String?) -> FamilyMember? {
        guard let id else { return nil }
        return members.first(where: { $0.id == id })
    }

    func login(as member: FamilyMember, pin: String) -> Bool {
        guard member.pin.isEmpty || member.pin == pin else {
            return false
        }
        currentMemberId = member.id
        return true
    }

    func saveProfile(_ member: FamilyMember) {
        guard let index = members.firstIndex(where: { $0.id == member.id }) else { return }
        members[index] = member
    }

    func addTask(_ task: PlannerTask) {
        tasks.insert(task, at: 0)
        NotificationManager.shared.scheduleReminder(for: task, assigneeName: memberName(task.assigneeId ?? task.requesterId))
    }

    func updateTask(_ task: PlannerTask) {
        guard let index = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        var updated = task
        updated.updatedAt = .now
        tasks[index] = updated
        NotificationManager.shared.scheduleReminder(for: updated, assigneeName: memberName(updated.assigneeId ?? updated.requesterId))
    }

    func deleteTask(_ task: PlannerTask) {
        tasks.removeAll { $0.id == task.id }
        NotificationManager.shared.cancelReminder(for: task)
    }

    func addComment(to task: PlannerTask, text: String) {
        guard let index = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        tasks[index].comments.append(
            TaskComment(id: UUID(), authorId: currentMemberId, createdAt: .now, text: text)
        )
        tasks[index].updatedAt = .now
    }

    func advance(_ task: PlannerTask) {
        guard let index = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        tasks[index].status = tasks[index].status.next
        if tasks[index].status == .assigned && tasks[index].assigneeId == nil {
            tasks[index].assigneeId = currentMemberId
        }
        tasks[index].updatedAt = .now
    }

    func tasks(on date: Date) -> [PlannerTask] {
        sortedTasks.filter { Calendar.current.isDate($0.dueDate, inSameDayAs: date) }
    }

    private func save() {
        let snapshot = PlannerSnapshot(members: members, tasks: tasks, currentMemberId: currentMemberId)
        guard let data = try? JSONEncoder.planner.encode(snapshot) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }
}

private extension JSONEncoder {
    static var planner: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }
}

private extension JSONDecoder {
    static var planner: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}
