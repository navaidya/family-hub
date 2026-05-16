import SwiftUI

enum TaskStatus: String, CaseIterable, Codable, Identifiable {
    case todo
    case discussion
    case assigned
    case done

    var id: String { rawValue }

    var label: String {
        switch self {
        case .todo: "To do"
        case .discussion: "Discuss"
        case .assigned: "Assigned"
        case .done: "Done"
        }
    }

    var next: TaskStatus {
        switch self {
        case .todo: .discussion
        case .discussion: .assigned
        case .assigned, .done: .done
        }
    }
}

enum PlannerTaskType: String, CaseIterable, Codable, Identifiable {
    case todo
    case ask
    case decision
    case appointment

    var id: String { rawValue }

    var label: String {
        switch self {
        case .todo: "To do"
        case .ask: "Ask"
        case .decision: "Decision"
        case .appointment: "Appointment"
        }
    }
}

enum TaskPriority: String, CaseIterable, Codable, Identifiable {
    case low
    case normal
    case high

    var id: String { rawValue }

    var label: String {
        switch self {
        case .low: "Low"
        case .normal: "Normal"
        case .high: "High"
        }
    }
}

struct MemberSettings: Codable, Equatable {
    var reminderDays: Int
    var includeInDigest: Bool
}

struct FamilyMember: Identifiable, Codable, Equatable {
    var id: String
    var name: String
    var age: Int
    var email: String
    var colorHex: String
    var pin: String
    var settings: MemberSettings
}

struct TaskComment: Identifiable, Codable, Equatable {
    var id: UUID
    var authorId: String
    var createdAt: Date
    var text: String
}

struct PlannerTask: Identifiable, Codable, Equatable {
    var id: UUID
    var title: String
    var type: PlannerTaskType
    var status: TaskStatus
    var requesterId: String
    var assigneeId: String?
    var dueDate: Date
    var priority: TaskPriority
    var requirements: String
    var comments: [TaskComment]
    var createdAt: Date
    var updatedAt: Date
}

struct PlannerSnapshot: Codable {
    var members: [FamilyMember]
    var tasks: [PlannerTask]
    var currentMemberId: String
}

extension FamilyMember {
    static let defaults: [FamilyMember] = [
        FamilyMember(
            id: "naval",
            name: "Naval",
            age: 46,
            email: "",
            colorHex: "#0F766E",
            pin: "1980",
            settings: MemberSettings(reminderDays: 7, includeInDigest: true)
        ),
        FamilyMember(
            id: "priyanka",
            name: "Priyanka",
            age: 43,
            email: "",
            colorHex: "#4754A3",
            pin: "1983",
            settings: MemberSettings(reminderDays: 7, includeInDigest: true)
        ),
        FamilyMember(
            id: "vivan",
            name: "Vivan",
            age: 16,
            email: "",
            colorHex: "#D95F43",
            pin: "2010",
            settings: MemberSettings(reminderDays: 5, includeInDigest: true)
        ),
        FamilyMember(
            id: "yuvika",
            name: "Yuvika",
            age: 9,
            email: "",
            colorHex: "#237A57",
            pin: "2017",
            settings: MemberSettings(reminderDays: 3, includeInDigest: true)
        )
    ]
}

extension PlannerTask {
    static func samples(now: Date = .now) -> [PlannerTask] {
        let calendar = Calendar.current
        return [
            PlannerTask(
                id: UUID(),
                title: "Review Yuvika's iPad ask",
                type: .ask,
                status: .discussion,
                requesterId: "yuvika",
                assigneeId: nil,
                dueDate: calendar.date(byAdding: .day, value: 5, to: now) ?? now,
                priority: .normal,
                requirements: "Understand why she wants it, budget range, school needs, and screen-time rules.",
                comments: [
                    TaskComment(id: UUID(), authorId: "yuvika", createdAt: now, text: "I want one for drawing and school games."),
                    TaskComment(id: UUID(), authorId: "naval", createdAt: now, text: "Let's collect requirements before deciding.")
                ],
                createdAt: now,
                updatedAt: now
            ),
            PlannerTask(
                id: UUID(),
                title: "Vivan driving practice plan",
                type: .todo,
                status: .assigned,
                requesterId: "vivan",
                assigneeId: "naval",
                dueDate: calendar.date(byAdding: .day, value: 2, to: now) ?? now,
                priority: .high,
                requirements: "Pick two practice windows, confirm route, and add a parent reminder.",
                comments: [],
                createdAt: now,
                updatedAt: now
            ),
            PlannerTask(
                id: UUID(),
                title: "Family dentist appointment",
                type: .appointment,
                status: .todo,
                requesterId: "priyanka",
                assigneeId: "priyanka",
                dueDate: calendar.date(byAdding: .day, value: 11, to: now) ?? now,
                priority: .normal,
                requirements: "Call the dentist and find one block for all four appointments.",
                comments: [],
                createdAt: now,
                updatedAt: now
            )
        ]
    }
}

extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&int)
        let red: UInt64
        let green: UInt64
        let blue: UInt64

        switch cleaned.count {
        case 6:
            red = (int >> 16) & 0xFF
            green = (int >> 8) & 0xFF
            blue = int & 0xFF
        default:
            red = 15
            green = 118
            blue = 110
        }

        self.init(
            .sRGB,
            red: Double(red) / 255,
            green: Double(green) / 255,
            blue: Double(blue) / 255,
            opacity: 1
        )
    }
}
