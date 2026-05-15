import EventKit
import Foundation

final class CalendarIntegration {
    static let shared = CalendarIntegration()
    private let eventStore = EKEventStore()

    private init() {}

    func addDueDate(for task: PlannerTask) async throws {
        let granted = try await requestAccess()
        guard granted else { return }

        let event = EKEvent(eventStore: eventStore)
        event.title = task.title
        event.notes = task.requirements
        event.startDate = task.dueDate
        event.endDate = Calendar.current.date(byAdding: .hour, value: 1, to: task.dueDate) ?? task.dueDate
        event.calendar = eventStore.defaultCalendarForNewEvents

        try eventStore.save(event, span: .thisEvent)
    }

    private func requestAccess() async throws -> Bool {
        if #available(iOS 17.0, macOS 14.0, *) {
            return try await eventStore.requestFullAccessToEvents()
        }

        return false
    }
}
