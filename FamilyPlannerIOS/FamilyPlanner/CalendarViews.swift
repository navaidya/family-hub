import SwiftUI

struct CalendarMonthView: View {
    @EnvironmentObject private var store: PlannerStore
    @State private var visibleMonth = Calendar.current.startOfMonth(for: .now)
    @State private var selectedDate = Date()
    @State private var selectedTask: PlannerTask?

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 8), count: 7)

    var body: some View {
        NavigationStack {
            List {
                Section {
                    monthHeader
                    weekdayHeader
                    LazyVGrid(columns: columns, spacing: 8) {
                        ForEach(daysForVisibleMonth, id: \.self) { date in
                            CalendarDayCell(
                                date: date,
                                visibleMonth: visibleMonth,
                                tasks: store.tasks(on: date),
                                selected: Calendar.current.isDate(date, inSameDayAs: selectedDate)
                            )
                            .onTapGesture {
                                selectedDate = date
                            }
                        }
                    }
                    .padding(.vertical, 6)
                }

                Section(selectedDate.formatted(date: .complete, time: .omitted)) {
                    let tasks = store.tasks(on: selectedDate)
                    if tasks.isEmpty {
                        Text("No due dates.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(tasks) { task in
                            Button {
                                selectedTask = task
                            } label: {
                                TaskRowView(task: task)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .navigationTitle("Calendar")
            .sheet(item: $selectedTask) { task in
                TaskDetailView(task: task)
                    .environmentObject(store)
            }
        }
    }

    private var monthHeader: some View {
        HStack {
            Button {
                visibleMonth = Calendar.current.date(byAdding: .month, value: -1, to: visibleMonth) ?? visibleMonth
            } label: {
                Image(systemName: "chevron.left")
            }

            Spacer()

            Text(visibleMonth.formatted(.dateTime.month(.wide).year()))
                .font(.headline)

            Spacer()

            Button {
                visibleMonth = Calendar.current.date(byAdding: .month, value: 1, to: visibleMonth) ?? visibleMonth
            } label: {
                Image(systemName: "chevron.right")
            }
        }
    }

    private var weekdayHeader: some View {
        HStack {
            ForEach(Calendar.current.shortWeekdaySymbols, id: \.self) { day in
                Text(day)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private var daysForVisibleMonth: [Date] {
        let calendar = Calendar.current
        let first = calendar.startOfMonth(for: visibleMonth)
        let weekdayOffset = calendar.component(.weekday, from: first) - 1
        let gridStart = calendar.date(byAdding: .day, value: -weekdayOffset, to: first) ?? first
        return (0..<42).compactMap { calendar.date(byAdding: .day, value: $0, to: gridStart) }
    }
}

struct CalendarDayCell: View {
    let date: Date
    let visibleMonth: Date
    let tasks: [PlannerTask]
    let selected: Bool

    var body: some View {
        VStack(spacing: 4) {
            Text("\(Calendar.current.component(.day, from: date))")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(inCurrentMonth ? .primary : .secondary)
                .frame(width: 32, height: 32)
                .background(selected ? Color.teal.opacity(0.18) : Color.clear, in: Circle())

            HStack(spacing: 3) {
                ForEach(tasks.prefix(3)) { task in
                    Circle()
                        .fill(task.priority == .high ? .orange : .teal)
                        .frame(width: 6, height: 6)
                }
            }
            .frame(height: 8)
        }
        .frame(minHeight: 48)
        .padding(4)
        .background(Calendar.current.isDateInToday(date) ? Color.teal.opacity(0.08) : Color.gray.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
    }

    private var inCurrentMonth: Bool {
        Calendar.current.isDate(date, equalTo: visibleMonth, toGranularity: .month)
    }
}

private extension Calendar {
    func startOfMonth(for date: Date) -> Date {
        let components = dateComponents([.year, .month], from: date)
        return self.date(from: components) ?? startOfDay(for: date)
    }
}
