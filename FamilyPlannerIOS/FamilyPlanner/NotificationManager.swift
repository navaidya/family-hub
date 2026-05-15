import Foundation
import UserNotifications

final class NotificationManager {
    static let shared = NotificationManager()
    private init() {}

    func requestAuthorizationIfNeeded() async -> Bool {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        if settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional {
            return true
        }

        do {
            return try await center.requestAuthorization(options: [.alert, .badge, .sound])
        } catch {
            return false
        }
    }

    func scheduleReminder(for task: PlannerTask, assigneeName: String) {
        guard task.status != .done else {
            cancelReminder(for: task)
            return
        }

        let content = UNMutableNotificationContent()
        content.title = "Family Planner"
        content.body = "\(task.title) is due for \(assigneeName)."
        content.sound = .default

        let reminderDate = Calendar.current.date(byAdding: .hour, value: -6, to: task.dueDate) ?? task.dueDate
        guard reminderDate > .now else { return }
        let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: reminderDate)
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        let request = UNNotificationRequest(identifier: task.id.uuidString, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request)
    }

    func cancelReminder(for task: PlannerTask) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [task.id.uuidString])
    }
}
