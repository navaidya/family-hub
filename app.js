const STORAGE_KEY = "family-planner-state-v1";

const statuses = [
  { id: "all", label: "All" },
  { id: "todo", label: "To do" },
  { id: "discussion", label: "Discuss" },
  { id: "assigned", label: "Assigned" },
  { id: "done", label: "Done" },
];

const familyMembers = [
  {
    id: "me",
    name: "Naval",
    age: 46,
    email: "me@example.com",
    color: "#0f766e",
    pin: "",
    settings: { reminderDays: 7, includeInDigest: true },
  },
  {
    id: "wife",
    name: "Priyanka",
    age: 43,
    email: "wife@example.com",
    color: "#4754a3",
    pin: "",
    settings: { reminderDays: 7, includeInDigest: true },
  },
  {
    id: "son",
    name: "Vivan",
    age: 16,
    email: "son@example.com",
    color: "#d95f43",
    pin: "",
    settings: { reminderDays: 5, includeInDigest: true },
  },
  {
    id: "daughter",
    name: "Yuvika",
    age: 9,
    email: "daughter@example.com",
    color: "#237a57",
    pin: "",
    settings: { reminderDays: 3, includeInDigest: true },
  },
];

const legacyNames = {
  me: "Me",
  wife: "Wife",
  son: "Son",
  daughter: "Daughter",
};

const today = new Date();
const isoToday = toISODate(today);

let state = loadState();
let activeStatus = "all";
let selectedTaskId = state.tasks[0]?.id ?? null;
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let pendingLoginMemberId = state.currentMemberId;

const elements = {
  currentProfileBtn: document.querySelector("#currentProfileBtn"),
  loginBtn: document.querySelector("#loginBtn"),
  memberStrip: document.querySelector("#memberStrip"),
  statusTabs: document.querySelector("#statusTabs"),
  taskList: document.querySelector("#taskList"),
  taskDetail: document.querySelector("#taskDetail"),
  calendarGrid: document.querySelector("#calendarGrid"),
  monthLabel: document.querySelector("#monthLabel"),
  contactsForm: document.querySelector("#contactsForm"),
  reminderList: document.querySelector("#reminderList"),
  searchInput: document.querySelector("#searchInput"),
  newTaskBtn: document.querySelector("#newTaskBtn"),
  taskDialog: document.querySelector("#taskDialog"),
  taskForm: document.querySelector("#taskForm"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  deleteTaskBtn: document.querySelector("#deleteTaskBtn"),
  dialogTitle: document.querySelector("#dialogTitle"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  emailDigestBtn: document.querySelector("#emailDigestBtn"),
  prevMonthBtn: document.querySelector("#prevMonthBtn"),
  nextMonthBtn: document.querySelector("#nextMonthBtn"),
  todayBtn: document.querySelector("#todayBtn"),
  loginDialog: document.querySelector("#loginDialog"),
  loginForm: document.querySelector("#loginForm"),
  loginMemberGrid: document.querySelector("#loginMemberGrid"),
  loginPin: document.querySelector("#loginPin"),
  loginError: document.querySelector("#loginError"),
  closeLoginBtn: document.querySelector("#closeLoginBtn"),
  cancelLoginBtn: document.querySelector("#cancelLoginBtn"),
  profileDialog: document.querySelector("#profileDialog"),
  profileForm: document.querySelector("#profileForm"),
  profileTitle: document.querySelector("#profileTitle"),
  profilePreview: document.querySelector("#profilePreview"),
  profileName: document.querySelector("#profileName"),
  profileAge: document.querySelector("#profileAge"),
  profileEmail: document.querySelector("#profileEmail"),
  profileColor: document.querySelector("#profileColor"),
  profilePin: document.querySelector("#profilePin"),
  profileReminderDays: document.querySelector("#profileReminderDays"),
  profileDigest: document.querySelector("#profileDigest"),
  closeProfileBtn: document.querySelector("#closeProfileBtn"),
  cancelProfileBtn: document.querySelector("#cancelProfileBtn"),
};

const form = {
  id: document.querySelector("#taskId"),
  title: document.querySelector("#taskTitle"),
  type: document.querySelector("#taskType"),
  status: document.querySelector("#taskStatus"),
  requester: document.querySelector("#taskRequester"),
  assignee: document.querySelector("#taskAssignee"),
  dueDate: document.querySelector("#taskDueDate"),
  priority: document.querySelector("#taskPriority"),
  description: document.querySelector("#taskDescription"),
};

render();
bindEvents();
registerServiceWorker();
handleLaunchAction();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        members: normalizeMembers(parsed.members),
        tasks: normalizeTasks(parsed.tasks?.length ? parsed.tasks : seedTasks()),
        currentMemberId: parsed.currentMemberId || "me",
      };
    } catch (error) {
      console.warn("Could not parse planner data", error);
    }
  }

  return {
    members: normalizeMembers(),
    tasks: normalizeTasks(seedTasks()),
    currentMemberId: "me",
  };
}

function normalizeMembers(savedMembers = []) {
  return familyMembers.map((defaultMember) => {
    const saved = savedMembers.find((member) => member.id === defaultMember.id) ?? {};
    const savedName = saved.name ?? defaultMember.name;
    const shouldUseDefaultName = savedName === legacyNames[defaultMember.id];

    return {
      ...defaultMember,
      ...saved,
      name: shouldUseDefaultName ? defaultMember.name : savedName,
      settings: {
        ...defaultMember.settings,
        ...(saved.settings ?? {}),
      },
    };
  });
}

function normalizeTasks(tasks = []) {
  return tasks.map((task) => ({
    ...task,
    title:
      {
        "Review daughter's iPad ask": "Review Yuvika's iPad ask",
        "Son driving practice plan": "Vivan driving practice plan",
      }[task.title] ?? task.title,
  }));
}

function seedTasks() {
  return [
    {
      id: crypto.randomUUID(),
      title: "Review Yuvika's iPad ask",
      type: "ask",
      status: "discussion",
      requester: "daughter",
      assignee: "",
      dueDate: addDays(isoToday, 5),
      priority: "normal",
      description: "Understand why she wants it, budget range, school needs, and screen-time rules.",
      comments: [
        {
          id: crypto.randomUUID(),
          author: "daughter",
          createdAt: new Date().toISOString(),
          text: "I want one for drawing and school games.",
        },
        {
          id: crypto.randomUUID(),
          author: "me",
          createdAt: new Date().toISOString(),
          text: "Let's collect requirements before deciding.",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Vivan driving practice plan",
      type: "todo",
      status: "assigned",
      requester: "son",
      assignee: "me",
      dueDate: addDays(isoToday, 2),
      priority: "high",
      description: "Pick two practice windows, confirm route, and add a parent reminder.",
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Family dentist appointment",
      type: "appointment",
      status: "todo",
      requester: "wife",
      assignee: "wife",
      dueDate: addDays(isoToday, 11),
      priority: "normal",
      description: "Call the dentist and find one block for all four appointments.",
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function bindEvents() {
  elements.currentProfileBtn.addEventListener("click", openProfileDialog);
  elements.loginBtn.addEventListener("click", () => openLoginDialog());
  elements.newTaskBtn.addEventListener("click", () => openTaskDialog());
  elements.closeDialogBtn.addEventListener("click", () => closeTaskDialog());
  elements.taskForm.addEventListener("submit", saveTaskFromForm);
  elements.deleteTaskBtn.addEventListener("click", deleteCurrentTask);
  elements.searchInput.addEventListener("input", renderTasks);
  elements.exportBtn.addEventListener("click", exportState);
  elements.importInput.addEventListener("change", importState);
  elements.emailDigestBtn.addEventListener("click", sendDigestEmail);
  elements.prevMonthBtn.addEventListener("click", () => changeMonth(-1));
  elements.nextMonthBtn.addEventListener("click", () => changeMonth(1));
  elements.todayBtn.addEventListener("click", () => {
    visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
  });

  elements.taskDialog.addEventListener("click", (event) => {
    if (event.target === elements.taskDialog) closeTaskDialog();
  });

  elements.loginForm.addEventListener("submit", loginAsSelectedMember);
  elements.closeLoginBtn.addEventListener("click", closeLoginDialog);
  elements.cancelLoginBtn.addEventListener("click", closeLoginDialog);
  elements.loginDialog.addEventListener("click", (event) => {
    if (event.target === elements.loginDialog) closeLoginDialog();
  });

  elements.profileForm.addEventListener("submit", saveProfileSettings);
  elements.closeProfileBtn.addEventListener("click", closeProfileDialog);
  elements.cancelProfileBtn.addEventListener("click", closeProfileDialog);
  elements.profileDialog.addEventListener("click", (event) => {
    if (event.target === elements.profileDialog) closeProfileDialog();
  });

  elements.profileName.addEventListener("input", renderProfilePreview);
  elements.profileColor.addEventListener("input", renderProfilePreview);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol === "file:") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

function handleLaunchAction() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("action") === "new-task") {
    window.addEventListener("load", () => openTaskDialog());
  }
}

function render() {
  renderCurrentProfile();
  renderMemberStrip();
  renderStatusTabs();
  populateFormOptions();
  renderTasks();
  renderDetail();
  renderCalendar();
  renderContacts();
  renderReminders();
  refreshIcons();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderCurrentProfile() {
  const member = currentMember();
  elements.currentProfileBtn.innerHTML = `
    <span class="avatar" style="background:${member.color}">${initials(member.name)}</span>
    <span>
      <strong>${escapeHTML(member.name)}</strong>
      <small>Profile</small>
    </span>
  `;
}

function renderMemberStrip() {
  elements.memberStrip.innerHTML = state.members
    .map((member) => {
      const assigned = state.tasks.filter((task) => task.assignee === member.id && task.status !== "done").length;
      const requested = state.tasks.filter((task) => task.requester === member.id && task.status !== "done").length;
      return `
        <button class="member-tile ${member.id === state.currentMemberId ? "current" : ""}" type="button" data-login-member="${member.id}">
          <div class="avatar" style="background:${member.color}">${initials(member.name)}</div>
          <div>
            <strong>${escapeHTML(member.name)}</strong>
            <span>${member.age} yrs · ${assigned} assigned · ${requested} asked</span>
          </div>
        </button>
      `;
    })
    .join("");

  elements.memberStrip.querySelectorAll("[data-login-member]").forEach((button) => {
    button.addEventListener("click", () => openLoginDialog(button.dataset.loginMember));
  });
}

function openLoginDialog(memberId = state.currentMemberId) {
  pendingLoginMemberId = memberId || state.currentMemberId;
  elements.loginPin.value = "";
  elements.loginError.textContent = "";
  renderLoginOptions();
  elements.loginDialog.showModal();
  if (getMember(pendingLoginMemberId)?.pin) {
    elements.loginPin.focus();
  }
  refreshIcons();
}

function renderLoginOptions() {
  elements.loginMemberGrid.innerHTML = state.members
    .map(
      (member) => `
        <button class="login-option ${member.id === pendingLoginMemberId ? "selected" : ""}" type="button" data-login-option="${member.id}">
          <span class="avatar" style="background:${member.color}">${initials(member.name)}</span>
          <span>
            <strong>${escapeHTML(member.name)}</strong><br />
            <small>${member.pin ? "PIN enabled" : "No PIN set"}</small>
          </span>
        </button>
      `,
    )
    .join("");

  elements.loginMemberGrid.querySelectorAll("[data-login-option]").forEach((button) => {
    button.addEventListener("click", () => {
      pendingLoginMemberId = button.dataset.loginOption;
      elements.loginError.textContent = "";
      renderLoginOptions();
      if (getMember(pendingLoginMemberId)?.pin) {
        elements.loginPin.focus();
      }
    });
  });
}

function loginAsSelectedMember(event) {
  event.preventDefault();
  const member = getMember(pendingLoginMemberId);
  if (!member) return;

  if (member.pin && elements.loginPin.value !== member.pin) {
    elements.loginError.textContent = "That PIN does not match.";
    elements.loginPin.focus();
    return;
  }

  state.currentMemberId = member.id;
  saveState();
  closeLoginDialog();
  render();
}

function closeLoginDialog() {
  elements.loginDialog.close();
  elements.loginForm.reset();
  elements.loginError.textContent = "";
}

function openProfileDialog() {
  const member = currentMember();
  elements.profileTitle.textContent = `${member.name}'s profile`;
  elements.profileName.value = member.name;
  elements.profileAge.value = member.age;
  elements.profileEmail.value = member.email;
  elements.profileColor.value = member.color;
  elements.profilePin.value = member.pin ?? "";
  elements.profileReminderDays.value = member.settings?.reminderDays ?? 7;
  elements.profileDigest.checked = member.settings?.includeInDigest ?? true;
  renderProfilePreview();
  elements.profileDialog.showModal();
  elements.profileName.focus();
  refreshIcons();
}

function renderProfilePreview() {
  const name = elements.profileName.value.trim() || currentMember().name;
  const color = elements.profileColor.value || currentMember().color;
  elements.profilePreview.innerHTML = `
    <span class="avatar" style="background:${escapeAttribute(color)}">${initials(name)}</span>
    <div>
      <strong>${escapeHTML(name)}</strong>
      <div class="reminder-meta">Signed in profile</div>
    </div>
  `;
}

function saveProfileSettings(event) {
  event.preventDefault();
  const member = currentMember();
  member.name = elements.profileName.value.trim();
  member.age = Number(elements.profileAge.value);
  member.email = elements.profileEmail.value.trim();
  member.color = elements.profileColor.value;
  member.pin = elements.profilePin.value.trim();
  member.settings = {
    reminderDays: Number(elements.profileReminderDays.value) || 7,
    includeInDigest: elements.profileDigest.checked,
  };

  saveState();
  closeProfileDialog();
  populateFormOptions();
  render();
}

function closeProfileDialog() {
  elements.profileDialog.close();
  elements.profileForm.reset();
}

function renderStatusTabs() {
  elements.statusTabs.innerHTML = statuses
    .map((status) => {
      const count = status.id === "all" ? state.tasks.length : state.tasks.filter((task) => task.status === status.id).length;
      return `
        <button class="segment ${activeStatus === status.id ? "active" : ""}" type="button" data-status="${status.id}">
          ${status.label} ${count}
        </button>
      `;
    })
    .join("");

  elements.statusTabs.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStatus = button.dataset.status;
      renderStatusTabs();
      renderTasks();
    });
  });
}

function populateFormOptions() {
  form.status.innerHTML = statuses
    .filter((status) => status.id !== "all")
    .map((status) => `<option value="${status.id}">${status.label}</option>`)
    .join("");

  const memberOptions = state.members
    .map((member) => `<option value="${member.id}">${escapeHTML(member.name)}</option>`)
    .join("");

  form.requester.innerHTML = memberOptions;
  form.assignee.innerHTML = `<option value="">Unassigned</option>${memberOptions}`;
}

function renderTasks() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const tasks = getSortedTasks().filter((task) => {
    const matchesStatus = activeStatus === "all" || task.status === activeStatus;
    const haystack = [task.title, task.description, task.type, memberName(task.requester), memberName(task.assignee)]
      .join(" ")
      .toLowerCase();
    return matchesStatus && (!query || haystack.includes(query));
  });

  if (!tasks.length) {
    elements.taskList.innerHTML = `<div class="empty-state">No tasks match this view.</div>`;
    return;
  }

  elements.taskList.innerHTML = tasks
    .map((task) => {
      const dueState = getDueState(task);
      const assignee = task.assignee ? memberName(task.assignee) : "Unassigned";
      return `
        <button class="task-row ${dueState} ${task.status === "done" ? "done" : ""} ${
          selectedTaskId === task.id ? "selected" : ""
        }" type="button" data-task-id="${task.id}">
          <span>
            <span class="task-title">${escapeHTML(task.title)}</span>
            <span class="task-meta">
              <span class="badge ${task.type}">${taskTypeLabel(task.type)}</span>
              ${task.priority === "high" ? `<span class="badge high">High</span>` : ""}
              <span>${escapeHTML(memberName(task.requester))} asked</span>
              <span>${escapeHTML(assignee)}</span>
            </span>
          </span>
          <span class="date-pill">
            <i data-lucide="calendar-days"></i>
            ${formatShortDate(task.dueDate)}
          </span>
        </button>
      `;
    })
    .join("");

  elements.taskList.querySelectorAll("[data-task-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTaskId = button.dataset.taskId;
      renderTasks();
      renderDetail();
      refreshIcons();
    });
  });

  refreshIcons();
}

function renderDetail() {
  const task = getSelectedTask();
  if (!task) {
    elements.taskDetail.className = "empty-detail";
    elements.taskDetail.innerHTML = `
      <i data-lucide="list-checks"></i>
      <h2>Select a task</h2>
      <p>Pick one from the list.</p>
    `;
    refreshIcons();
    return;
  }

  elements.taskDetail.className = "detail-stack";
  const comments = task.comments.length
    ? task.comments
        .map(
          (comment) => `
            <article class="comment">
              <div class="comment-meta">${escapeHTML(memberName(comment.author))} · ${formatDateTime(comment.createdAt)}</div>
              <p>${escapeHTML(comment.text)}</p>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">No discussion yet.</div>`;

  elements.taskDetail.innerHTML = `
    <div class="detail-top">
      <div>
        <p class="eyebrow">${taskTypeLabel(task.type)}</p>
        <h2 class="detail-title">${escapeHTML(task.title)}</h2>
      </div>
      <div class="detail-actions">
        <button class="secondary-button" type="button" data-action="edit"><i data-lucide="pencil"></i>Edit</button>
        <button class="secondary-button" type="button" data-action="email"><i data-lucide="mail"></i>Email</button>
        <button class="chip-button" type="button" data-action="advance"><i data-lucide="${nextStatusIcon(task.status)}"></i>${nextStatusLabel(task.status)}</button>
      </div>
    </div>

    <section class="detail-facts">
      <div class="fact"><span>Status</span><strong>${statusLabel(task.status)}</strong></div>
      <div class="fact"><span>Due</span><strong>${formatLongDate(task.dueDate)}</strong></div>
      <div class="fact"><span>Requested by</span><strong>${escapeHTML(memberName(task.requester))}</strong></div>
      <div class="fact"><span>Assigned to</span><strong>${escapeHTML(task.assignee ? memberName(task.assignee) : "Unassigned")}</strong></div>
    </section>

    <section class="requirements">
      <h3>Requirements</h3>
      <p class="task-description">${escapeHTML(task.description || "No requirements added.")}</p>
    </section>

    <section class="conversation">
      <h3>Conversation</h3>
      ${comments}
      <form class="comment-form" data-comment-form>
        <select aria-label="Comment author" name="author">
          ${state.members
            .map(
              (member) =>
                `<option value="${member.id}" ${member.id === state.currentMemberId ? "selected" : ""}>${escapeHTML(member.name)}</option>`,
            )
            .join("")}
        </select>
        <input aria-label="Comment" name="text" placeholder="Add a note or requirement" required maxlength="220" />
        <button class="primary-button" type="submit"><i data-lucide="send"></i>Send</button>
      </form>
    </section>
  `;

  elements.taskDetail.querySelector('[data-action="edit"]').addEventListener("click", () => openTaskDialog(task));
  elements.taskDetail.querySelector('[data-action="email"]').addEventListener("click", () => sendTaskEmail(task));
  elements.taskDetail.querySelector('[data-action="advance"]').addEventListener("click", () => advanceTask(task.id));
  elements.taskDetail.querySelector("[data-comment-form]").addEventListener("submit", addComment);
  refreshIcons();
}

function renderCalendar() {
  const monthName = visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  elements.monthLabel.textContent = monthName;

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const start = new Date(visibleMonth);
  start.setDate(1 - start.getDay());

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }

  elements.calendarGrid.innerHTML = `
    ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}
    ${days
      .map((date) => {
        const iso = toISODate(date);
        const tasks = state.tasks.filter((task) => task.dueDate === iso);
        const outside = date.getMonth() !== visibleMonth.getMonth();
        const isToday = iso === isoToday;
        return `
          <div class="calendar-day ${outside ? "outside" : ""} ${isToday ? "today" : ""}">
            <span class="day-number">${date.getDate()}</span>
            <div class="calendar-items">
              ${tasks
                .map(
                  (task) => `
                    <button class="calendar-task ${task.priority} ${task.status === "done" ? "done" : ""}" type="button" data-task-id="${task.id}" title="${escapeAttribute(task.title)}">
                      ${escapeHTML(task.title)}
                    </button>
                  `,
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("")}
  `;

  elements.calendarGrid.querySelectorAll("[data-task-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTaskId = button.dataset.taskId;
      renderTasks();
      renderDetail();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderContacts() {
  elements.contactsForm.innerHTML = `
    <h3>Contacts</h3>
    ${state.members
      .map(
        (member) => `
          <div class="contact-row ${member.id === state.currentMemberId ? "current" : ""}">
            <label for="email-${member.id}">${escapeHTML(member.name)}</label>
            <input id="email-${member.id}" type="email" value="${escapeAttribute(member.email)}" data-member-email="${member.id}" autocomplete="email" />
          </div>
        `,
      )
      .join("")}
  `;

  elements.contactsForm.querySelectorAll("[data-member-email]").forEach((input) => {
    input.addEventListener("change", () => {
      const member = state.members.find((item) => item.id === input.dataset.memberEmail);
      if (!member) return;
      member.email = input.value.trim();
      saveState();
      renderCurrentProfile();
    });
  });
}

function renderReminders() {
  const tasks = getSortedTasks()
    .filter((task) => task.status !== "done")
    .filter((task) => {
      const days = daysUntil(task.dueDate);
      const owner = getMember(task.assignee || task.requester);
      return days <= (owner?.settings?.reminderDays ?? 7);
    })
    .slice(0, 6);

  if (!tasks.length) {
    elements.reminderList.innerHTML = `<div class="empty-state">No upcoming reminders.</div>`;
    return;
  }

  elements.reminderList.innerHTML = tasks
    .map((task) => {
      const owner = task.assignee || task.requester;
      return `
        <article class="reminder-item">
          <div class="reminder-row">
            <div>
              <div class="reminder-title">${escapeHTML(task.title)}</div>
              <div class="reminder-meta">${formatDuePhrase(task.dueDate)} · ${escapeHTML(memberName(owner))}</div>
            </div>
            <button class="icon-button" type="button" data-email-task="${task.id}" title="Email reminder" aria-label="Email reminder">
              <i data-lucide="mail">@</i>
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  elements.reminderList.querySelectorAll("[data-email-task]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.tasks.find((item) => item.id === button.dataset.emailTask);
      if (task) sendTaskEmail(task);
    });
  });

  refreshIcons();
}

function openTaskDialog(task = null) {
  elements.dialogTitle.textContent = task ? "Edit task" : "New task";
  elements.deleteTaskBtn.style.visibility = task ? "visible" : "hidden";

  form.id.value = task?.id ?? "";
  form.title.value = task?.title ?? "";
  form.type.value = task?.type ?? "todo";
  form.status.value = task?.status ?? "todo";
  form.requester.value = task?.requester ?? state.currentMemberId;
  form.assignee.value = task?.assignee ?? "";
  form.dueDate.value = task?.dueDate ?? isoToday;
  form.priority.value = task?.priority ?? "normal";
  form.description.value = task?.description ?? "";

  elements.taskDialog.showModal();
  form.title.focus();
  refreshIcons();
}

function closeTaskDialog() {
  elements.taskDialog.close();
  elements.taskForm.reset();
}

function saveTaskFromForm(event) {
  event.preventDefault();
  const id = form.id.value || crypto.randomUUID();
  const existing = state.tasks.find((task) => task.id === id);
  const task = {
    id,
    title: form.title.value.trim(),
    type: form.type.value,
    status: form.status.value,
    requester: form.requester.value,
    assignee: form.assignee.value,
    dueDate: form.dueDate.value,
    priority: form.priority.value,
    description: form.description.value.trim(),
    comments: existing?.comments ?? [],
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    state.tasks = state.tasks.map((item) => (item.id === id ? task : item));
  } else {
    state.tasks.unshift(task);
  }

  selectedTaskId = id;
  saveState();
  closeTaskDialog();
  render();
}

function deleteCurrentTask() {
  const id = form.id.value;
  if (!id) return;
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  const confirmed = window.confirm(`Delete "${task.title}"?`);
  if (!confirmed) return;

  state.tasks = state.tasks.filter((item) => item.id !== id);
  selectedTaskId = state.tasks[0]?.id ?? null;
  saveState();
  closeTaskDialog();
  render();
}

function addComment(event) {
  event.preventDefault();
  const task = getSelectedTask();
  if (!task) return;

  const data = new FormData(event.currentTarget);
  const text = String(data.get("text") || "").trim();
  if (!text) return;

  task.comments.push({
    id: crypto.randomUUID(),
    author: String(data.get("author")),
    createdAt: new Date().toISOString(),
    text,
  });
  task.updatedAt = new Date().toISOString();
  saveState();
  renderDetail();
}

function advanceTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  const order = ["todo", "discussion", "assigned", "done"];
  const next = order[Math.min(order.indexOf(task.status) + 1, order.length - 1)];
  task.status = next;
  if (next === "assigned" && !task.assignee) task.assignee = task.requester;
  task.updatedAt = new Date().toISOString();
  saveState();
  render();
}

function sendTaskEmail(task) {
  const recipient = memberEmail(task.assignee || task.requester);
  if (!recipient) {
    window.alert("Add an email address in Contacts first.");
    return;
  }

  const subject = `Family Planner: ${task.title}`;
  const body = [
    `Task: ${task.title}`,
    `Status: ${statusLabel(task.status)}`,
    `Due: ${formatLongDate(task.dueDate)}`,
    `Requested by: ${memberName(task.requester)}`,
    `Assigned to: ${task.assignee ? memberName(task.assignee) : "Unassigned"}`,
    "",
    "Requirements:",
    task.description || "No requirements added.",
    "",
    "Latest conversation:",
    task.comments.at(-1)?.text || "No discussion yet.",
  ].join("\n");

  openMail(recipient, subject, body);
}

function sendDigestEmail() {
  const recipients = state.members
    .filter((member) => member.settings?.includeInDigest ?? true)
    .map((member) => member.email)
    .filter(Boolean);
  if (!recipients.length) {
    window.alert("Add email addresses in Contacts first.");
    return;
  }

  const activeTasks = getSortedTasks().filter((task) => task.status !== "done");
  const body = activeTasks.length
    ? activeTasks
        .map(
          (task) =>
            `- ${task.title}\n  Status: ${statusLabel(task.status)}\n  Due: ${formatLongDate(task.dueDate)}\n  Owner: ${
              task.assignee ? memberName(task.assignee) : "Unassigned"
            }`,
        )
        .join("\n\n")
    : "No active tasks.";

  openMail(
    recipients.join(","),
    "Family Planner digest",
    `Family task progress\n\n${body}`,
  );
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `family-planner-${isoToday}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importState(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = JSON.parse(String(reader.result));
      if (!Array.isArray(imported.tasks) || !Array.isArray(imported.members)) {
        throw new Error("Invalid planner file");
      }
      state = {
        members: normalizeMembers(imported.members),
        tasks: normalizeTasks(imported.tasks),
        currentMemberId: imported.currentMemberId || "me",
      };
      selectedTaskId = state.tasks[0]?.id ?? null;
      saveState();
      render();
    } catch (error) {
      window.alert("That backup file could not be imported.");
      console.error(error);
    } finally {
      elements.importInput.value = "";
    }
  });
  reader.readAsText(file);
}

function changeMonth(delta) {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + delta, 1);
  renderCalendar();
}

function getSelectedTask() {
  return state.tasks.find((task) => task.id === selectedTaskId) ?? null;
}

function getSortedTasks() {
  return [...state.tasks].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    const dateDiff = a.dueDate.localeCompare(b.dueDate);
    if (dateDiff !== 0) return dateDiff;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

function getDueState(task) {
  if (task.status === "done") return "done";
  const diff = daysUntil(task.dueDate);
  if (diff < 0) return "overdue";
  if (diff <= 3) return "soon";
  return "";
}

function formatDuePhrase(dateString) {
  const days = daysUntil(dateString);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function daysUntil(dateString) {
  const target = parseLocalDate(dateString);
  const base = parseLocalDate(isoToday);
  return Math.round((target - base) / 86400000);
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString, amount) {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

function formatShortDate(dateString) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatLongDate(dateString) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function currentMember() {
  return getMember(state.currentMemberId) ?? state.members[0] ?? familyMembers[0];
}

function getMember(id) {
  return state.members.find((member) => member.id === id) ?? null;
}

function memberName(id) {
  return getMember(id)?.name ?? "Unassigned";
}

function memberEmail(id) {
  return getMember(id)?.email ?? "";
}

function taskTypeLabel(type) {
  return {
    todo: "To do",
    ask: "Ask",
    decision: "Decision",
    appointment: "Appointment",
  }[type];
}

function statusLabel(status) {
  return statuses.find((item) => item.id === status)?.label ?? status;
}

function nextStatusLabel(status) {
  return {
    todo: "Discuss",
    discussion: "Assign",
    assigned: "Done",
    done: "Done",
  }[status];
}

function nextStatusIcon(status) {
  return {
    todo: "messages-square",
    discussion: "user-check",
    assigned: "check",
    done: "check-check",
  }[status];
}

function openMail(to, subject, body) {
  const recipients = to
    .split(",")
    .map((address) => encodeURIComponent(address.trim()))
    .filter(Boolean)
    .join(",");
  const params = new URLSearchParams({ subject, body });
  window.location.href = `mailto:${recipients}?${params.toString()}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value).replaceAll("\n", " ");
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
